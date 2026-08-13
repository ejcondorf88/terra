import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTReading } from './entities/iot-reading.entity';
import { ClimateData } from './entities/climate-data.entity';
import { IoTAlert } from './entities/iot-alert.entity';
import { CreateIotReadingDto } from './dto/create-iot-reading.dto';
import { CreateIoTAlertDto } from './dto/create-iot-alert.dto';
import { DroneDataDto } from './dto/drone-data.dto';
import { ClimateApiService } from './adapters/climate-api.service';
import { IoTAlertNotificationService } from './iot-alert-notification.service';

@Injectable()
export class IoTService {
  private readonly logger = new Logger(IoTService.name);

  constructor(
    @InjectRepository(IoTReading) private readonly readingRepo: Repository<IoTReading>,
    @InjectRepository(ClimateData) private readonly climateRepo: Repository<ClimateData>,
    @InjectRepository(IoTAlert) private readonly alertRepo: Repository<IoTAlert>,
    private readonly climateApi: ClimateApiService,
    private readonly notificationService: IoTAlertNotificationService,
  ) {}

  async createReading(dto: CreateIotReadingDto) {
    const r = this.readingRepo.create({
      plotId: dto.plotId ?? null,
      tenantId: dto.tenantId ?? null,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      humidity: dto.humidity,
      temperature: dto.temperature,
      ph: dto.ph,
      pests: dto.pests,
      source: 'sensor',
    } as Partial<IoTReading>);
    const saved = await this.readingRepo.save(r);
    // Check basic alerting rules
    await this.checkForAlerts(saved);
    return saved;
  }

  async createDroneData(dto: DroneDataDto) {
    const normalized = this.normalizeDroneData(dto);
    const r = this.readingRepo.create({
      ...normalized,
      source: 'drone',
    } as Partial<IoTReading>);
    const saved = await this.readingRepo.save(r);
    // Check basic alerting rules for drone-derived metrics
    await this.checkForAlerts(saved);
    return saved;
  }

  private normalizeDroneData(dto: DroneDataDto): Partial<IoTReading> {
    const pests = dto.pests ?? dto.metadata?.pests ?? null;
    let normalizedPests: any = null;
    if (Array.isArray(pests)) {
      normalizedPests = pests.map((item) =>
        typeof item === 'string' ? item.trim().toLowerCase() : item,
      );
    } else if (typeof pests === 'string') {
      try {
        normalizedPests = JSON.parse(pests);
      } catch {
        normalizedPests = pests
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean);
      }
    } else if (pests && typeof pests === 'object') {
      normalizedPests = pests;
    }

    let normalizedNdvi: number | undefined = undefined;
    if (typeof dto.ndvi === 'number') {
      normalizedNdvi = Math.min(1, Math.max(0, dto.ndvi));
    }

    let normalizedBiomass: number | undefined = undefined;
    if (typeof dto.biomass === 'number') {
      normalizedBiomass = dto.biomass;
      if (normalizedBiomass > 100 && normalizedBiomass < 10000) {
        normalizedBiomass = Number((normalizedBiomass / 1000).toFixed(2));
      }
    }

    return {
      plotId: dto.plotId ?? null,
      tenantId: dto.tenantId ?? null,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      ndvi: normalizedNdvi,
      biomass: normalizedBiomass,
      imageUrl: dto.imageUrl,
      pests: normalizedPests,
    } as Partial<IoTReading>;
  }

  private async checkForAlerts(reading: IoTReading) {
    const alerts: Partial<IoTAlert>[] = [];
    if (typeof reading.humidity === 'number' && reading.humidity < 30) {
      alerts.push({
        plotId: reading.plotId ?? null,
        tenantId: reading.tenantId ?? null,
        type: 'humidity',
        message: `Low humidity detected: ${reading.humidity}%`,
        value: reading.humidity,
        threshold: 30,
        severity: 'high',
      });
    }

    if (typeof reading.ndvi === 'number' && reading.ndvi < 0.4) {
      alerts.push({
        plotId: reading.plotId ?? null,
        tenantId: reading.tenantId ?? null,
        type: 'ndvi',
        message: `Low NDVI detected: ${reading.ndvi}`,
        value: reading.ndvi,
        threshold: 0.4,
        severity: 'medium',
      });
    }

    for (const a of alerts) {
      const ent = this.alertRepo.create(a as IoTAlert);
      await this.alertRepo.save(ent);
      try {
        await this.notificationService.notifyOnAlert(ent);
      } catch (error) {
        this.logger.warn(`Failed to send IoT alert notification: ${error}`);
      }
    }
  }

  async getReadingsForPlot(plotId: number) {
    const readings = await this.readingRepo.find({ where: { plotId }, order: { timestamp: 'DESC' }, take: 200 });

    // Optionally fetch recent climate data through adapter (coordinates needed)
    // For MVP we return readings and any stored climate data
    const climate = await this.climateRepo.find({ where: { plotId }, order: { timestamp: 'DESC' }, take: 5 });

    return { readings, climate };
  }

  async createAlert(dto: CreateIoTAlertDto) {
    const alert = this.alertRepo.create({
      plotId: dto.plotId ?? null,
      tenantId: dto.tenantId ?? null,
      type: dto.type,
      message: dto.message,
      value: dto.value,
      threshold: dto.threshold,
      severity: 'low',
      resolved: false,
    } as Partial<IoTAlert>);
    return this.alertRepo.save(alert);
  }

  async getAlerts(filter?: { plotId?: number; tenantId?: number; unresolvedOnly?: boolean }) {
    const where: any = {};
    if (filter?.plotId) where.plotId = filter.plotId;
    if (filter?.tenantId) where.tenantId = filter.tenantId;
    if (filter?.unresolvedOnly === false) {
      // request both resolved and unresolved alerts
    } else {
      where.resolved = false;
    }
    return this.alertRepo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async findAllAlerts(unresolvedOnly = true) {
    return this.getAlerts({ unresolvedOnly });
  }

  async getAlertById(id: number) {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`IoT alert ${id} not found`);
    }
    return alert;
  }

  async findAlertById(id: number) {
    return this.getAlertById(id);
  }

  async resolveAlert(id: number) {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`IoT alert ${id} not found`);
    }
    alert.resolved = true;
    alert.resolvedAt = new Date();
    return this.alertRepo.save(alert);
  }

  // Helper: fetch climate from external API and persist
  async fetchAndStoreClimate(plotId: number, lat: number, lon: number, tenantId?: number) {
    const res = await this.climateApi.fetchRecentClimateForPlot(plotId, lat, lon);
    if (!res) return null;
    const cd = this.climateRepo.create({
      plotId,
      tenantId: tenantId ?? null,
      provider: res.provider,
      data: res.data,
      timestamp: new Date(),
    } as Partial<ClimateData>);
    return this.climateRepo.save(cd);
  }
}
