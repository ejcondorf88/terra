import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from '../../entities/certification.entity';
import { EudrRegistry } from '../../entities/eudr-registry.entity';
import { EsgReport } from '../../entities/esg-report.entity';
import { Plot } from '../../entities/plot.entity';
import { SatelliteValidation } from '../../entities/satellite-validation.entity';
import { TraceService } from './services/trace.service';
import { SatelliteAdapterService } from './services/satellite.adapter';
import { RegisterEudrDto } from './dto/register-eudr.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { GenerateEsgReportDto } from './dto/generate-esg-report.dto';
import { SatelliteValidationDto } from './dto/satellite-validation.dto';
import { AlertsSummaryDto } from './dto/alerts-summary.dto';
import { IoTService } from '../iot/iot.service';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    @InjectRepository(EudrRegistry)
    private readonly eudrRepository: Repository<EudrRegistry>,
    @InjectRepository(EsgReport)
    private readonly esgRepository: Repository<EsgReport>,
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
    @InjectRepository(SatelliteValidation)
    private readonly satelliteValidationRepository: Repository<SatelliteValidation>,
    private readonly traceService: TraceService,
    private readonly satelliteAdapter: SatelliteAdapterService,
    private readonly iotService: IoTService,
  ) {}

  async createCertification(record: CreateCertificationDto) {
    const entity = this.certificationRepository.create({
      ...record,
      valid_from: record.valid_from ? new Date(record.valid_from) : undefined,
      valid_until: record.valid_until ? new Date(record.valid_until) : undefined,
    });
    return this.certificationRepository.save(entity);
  }

  async findCertification(id: number) {
    const certification = await this.certificationRepository.findOne({ where: { id } });
    if (!certification) {
      throw new NotFoundException('Certification not found');
    }
    return certification;
  }

  async findAllCertifications() {
    return this.certificationRepository.find();
  }

  async registerEudr(record: RegisterEudrDto, tenantId?: number) {
    // Delegar a TraceService para validación y enriquecimiento con TRACES
    const { validationDetails, ...eudrRecord } = await this.traceService.registerOperatorEudr(
      record,
      tenantId,
    );
    return eudrRecord;
  }

  async getEudrStatus(traceId: string, tenantId?: number) {
    const registry = await this.eudrRepository.findOne({
      where: { trace_id: traceId, ...(tenantId && { tenant_id: tenantId }) },
    });
    if (!registry) {
      throw new NotFoundException('EUDR record not found');
    }

    // Sincronizar con TRACES para obtener estado actual
    try {
      const { tracesStatus, riskAssessment } = await this.traceService.getTraceComplianceStatus(
        traceId,
        tenantId,
      );
      return {
        ...registry,
        tracesValidation: tracesStatus,
        riskAssessment,
      };
    } catch (error) {
      // Si TRACES no está disponible, retornar estado BD
      return registry;
    }
  }

  async validateSatellite(dto: SatelliteValidationDto) {
    const plot = await this.plotRepository.findOne({ where: { id: Number(dto.plotId) } });
    if (!plot) {
      throw new NotFoundException('Plot not found');
    }

    const response = await this.satelliteAdapter.validatePlot(dto.coordinates, dto.dateRange);
    const iotContext = await this.iotService.getReadingsForPlot(plot.id);

    const entity = this.satelliteValidationRepository.create({
      plot_id: plot.id,
      ndvi: response.ndvi,
      forest_cover_percentage: response.forestCoverPercentage,
      recent_deforestation_detected: response.recentDeforestationDetected,
      deforestation_review_date: response.deforestationReviewDate,
      source: response.source,
      details: response.details,
      range_start: dto.dateRange ? new Date(dto.dateRange.from) : undefined,
      range_end: dto.dateRange ? new Date(dto.dateRange.to) : undefined,
    });

    const saved = await this.satelliteValidationRepository.save(entity);
    return {
      ...saved,
      iotContext: {
        readingCount: iotContext.readings.length,
        climateCount: iotContext.climate.length,
        latestReading: iotContext.readings[0] ?? null,
        activeAlerts: await this.iotService.getAlerts({ plotId: plot.id, unresolvedOnly: true }),
      },
    };
  }

  async syncEudr(traceId: string, tenantId?: number) {
    const registry = await this.eudrRepository.findOne({
      where: { trace_id: traceId, ...(tenantId && { tenant_id: tenantId }) },
    });

    if (!registry) {
      throw new NotFoundException('EUDR record not found');
    }

    return this.traceService.syncWithTraces(registry.id);
  }

  async buildAlertsDashboard(tenantId?: number): Promise<AlertsSummaryDto> {
    const alerts = await this.iotService.getAlerts({ tenantId, unresolvedOnly: true });
    return this.buildAlertsSummary(alerts);
  }

  async getAlertsDashboard(plotId: number): Promise<AlertsSummaryDto> {
    const alerts = await this.iotService.getAlerts({ plotId, unresolvedOnly: true });
    return this.buildAlertsSummary(alerts);
  }

  private buildAlertsSummary(alerts: any[]): AlertsSummaryDto {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byType: Record<string, number> = {};
    let recentCount = 0;
    const typeRecurrenceMap: Record<string, number> = {};

    for (const alert of alerts) {
      const severity = (alert.severity || 'low') as keyof typeof bySeverity;
      if (severity in bySeverity) {
        bySeverity[severity]++;
      }

      const type = alert.type || 'unknown';
      byType[type] = (byType[type] ?? 0) + 1;

      if (new Date(alert.createdAt) >= thirtyDaysAgo) {
        recentCount++;
        typeRecurrenceMap[type] = (typeRecurrenceMap[type] ?? 0) + 1;
      }
    }

    const recurringTypes = Object.entries(typeRecurrenceMap)
      .filter(([_, count]) => count >= 2)
      .map(([type]) => type);

    const severityText =
      bySeverity.critical > 0 || bySeverity.high > 0
        ? ` (${bySeverity.critical} critical, ${bySeverity.high} high, ${bySeverity.medium} medium, ${bySeverity.low} low)`
        : '';

    const recurrenceText = recurringTypes.length
      ? ` | Recurring: ${recurringTypes.join(', ')} (30-day window)`
      : '';

    const summary = `IoT alerts: ${alerts.length} unresolved${severityText}${recurrenceText}. Recent (30d): ${recentCount}`;

    return {
      totalUnresolved: alerts.length,
      bySeverity,
      byType: {
        humidity: byType.humidity ?? 0,
        ndvi: byType.ndvi ?? 0,
        ph: byType.ph ?? 0,
        pest: byType.pest ?? 0,
        ...byType,
      },
      recurringTypes,
      recentCount30d: recentCount,
      summaryText: summary,
    };
  }

  async generateEsgReport(record: GenerateEsgReportDto) {
    const alerts = record.plot_id
      ? await this.iotService.getAlerts({ plotId: record.plot_id, unresolvedOnly: true })
      : [];

    const alertsSummary = this.buildAlertsSummary(alerts);
    const details = [record.details, alertsSummary.summaryText].filter(Boolean).join('\n');

    const entity = this.esgRepository.create({
      ...record,
      details,
      report_date: record.report_date ? new Date(record.report_date) : undefined,
    });
    return this.esgRepository.save(entity);
  }

  async findEsgReport(id: number) {
    const report = await this.esgRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('ESG report not found');
    }
    return report;
  }
}
