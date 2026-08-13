import { Injectable, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EudrRegistry } from '../../../entities/eudr-registry.entity';
import { TraceAdapter, TraceValidationResponse, TraceRegistrationRequest } from '../adapters/trace.adapter';
import { RegisterEudrDto } from '../dto/register-eudr.dto';

/**
 * TraceService
 * 
 * Encapsula la lógica de negocio para validación y registro EUDR.
 * Integra con TraceAdapter para comunicación con TRACES API.
 * 
 * Responsabilidades:
 * - Validar traceId y eoriNumber
 * - Enriquecer registros EUDR con datos de TRACES
 * - Gestionar riesgos de cumplimiento
 * - Registrar auditoría de cambios
 */
@Injectable()
export class TraceService {
  private readonly logger = new Logger('TraceService');

  constructor(
    private readonly traceAdapter: TraceAdapter,
    @InjectRepository(EudrRegistry)
    private readonly eudrRepository: Repository<EudrRegistry>,
  ) {}

  /**
   * Registra un nuevo operador/lote en EUDR con validación TRACES
   */
  async registerOperatorEudr(
    dto: RegisterEudrDto,
    tenantId?: number,
  ): Promise<EudrRegistry & { validationDetails: TraceValidationResponse }> {
    this.logger.log(`Registering EUDR for trace: ${dto.trace_id}`);

    // 1️⃣ Validar formato de trace_id
    if (!this.traceAdapter.validateTraceIdFormat(dto.trace_id)) {
      throw new BadRequestException(
        `Invalid trace_id format. Expected UUID or TRACE-YYYY-XXXXXX format.`,
      );
    }

    // 2️⃣ Verificar que no existe ya un registro con este trace_id
    const existingRecord = await this.eudrRepository.findOne({
      where: { trace_id: dto.trace_id, tenant_id: tenantId },
    });
    if (existingRecord) {
      throw new ConflictException(
        `EUDR record already exists for trace_id: ${dto.trace_id}`,
      );
    }

    // 3️⃣ Validar contra TRACES API
    let validationDetails: TraceValidationResponse;
    try {
      validationDetails = await this.traceAdapter.validateTrace(dto.trace_id);
    } catch (error: any) {
      this.logger.warn(`TRACES validation warning: ${error.message}`);
      // Continuar con estado "unknown" si TRACES no está disponible
      validationDetails = {
        traceId: dto.trace_id,
        isValid: false,
        complianceStatus: 'unknown',
        issues: [`TRACES validation unavailable: ${error.message}`],
      };
    }

    // 4️⃣ Crear registro EUDR enriquecido
    const enrichedRecord: Partial<EudrRegistry> = {
      ...dto,
      tenant_id: tenantId,
      compliance_status: validationDetails.complianceStatus,
      eori_number: validationDetails.eoriNumber,
      operator_name: validationDetails.operatorName,
      is_valid: validationDetails.isValid,
      risk_level: validationDetails.riskLevel,
      trace_registered_date: validationDetails.registeredDate
        ? new Date(validationDetails.registeredDate)
        : undefined,
      trace_last_updated: validationDetails.lastUpdated
        ? new Date(validationDetails.lastUpdated)
        : undefined,
      issues: validationDetails.issues?.join('; ') || '',
      trace_url: validationDetails.operatorName
        ? `https://traces.ec.europa.eu/public/operatorList/${validationDetails.operatorName}`
        : dto.trace_url,
    };

    // 5️⃣ Guardar en BD
    const entity = this.eudrRepository.create(enrichedRecord);
    const saved = await this.eudrRepository.save(entity);

    this.logger.log(
      `EUDR registered successfully: ID ${saved.id}, trace_id: ${dto.trace_id}, status: ${validationDetails.complianceStatus}`,
    );

    return { ...saved, validationDetails };
  }

  /**
   * Obtiene el estado de cumplimiento de un trace
   */
  async getTraceComplianceStatus(traceId: string, tenantId?: number): Promise<{
    eudrRecord: EudrRegistry;
    tracesStatus: TraceValidationResponse;
    riskAssessment: { level: string; issues: string[] };
  }> {
    // 1️⃣ Obtener registro BD
    const eudrRecord = await this.eudrRepository.findOne({
      where: { trace_id: traceId, ...(tenantId && { tenant_id: tenantId }) },
    });

    if (!eudrRecord) {
      throw new Error(`EUDR record not found for trace_id: ${traceId}`);
    }

    // 2️⃣ Validar contra TRACES (cachear cada 24h en producción)
    let tracesStatus: TraceValidationResponse;
    try {
      tracesStatus = await this.traceAdapter.validateTrace(traceId);
    } catch (error: any) {
      this.logger.warn(`Could not validate trace ${traceId}: ${error.message}`);
      tracesStatus = {
        traceId,
        isValid: false,
        complianceStatus: 'unknown',
        issues: [error.message],
      };
    }

    // 3️⃣ Evaluación de riesgos
    const riskAssessment = this.assessComplianceRisk(tracesStatus);

    // 4️⃣ Actualizar registro si hay cambios
    let shouldSave = false;
    if (tracesStatus.complianceStatus !== eudrRecord.compliance_status) {
      eudrRecord.compliance_status = tracesStatus.complianceStatus;
      shouldSave = true;
    }

    if (tracesStatus.issues && tracesStatus.issues.length > 0) {
      eudrRecord.issues = tracesStatus.issues.join('; ');
      shouldSave = true;
    }

    if (tracesStatus.eoriNumber && tracesStatus.eoriNumber !== eudrRecord.eori_number) {
      eudrRecord.eori_number = tracesStatus.eoriNumber;
      shouldSave = true;
    }

    if (tracesStatus.operatorName && tracesStatus.operatorName !== eudrRecord.operator_name) {
      eudrRecord.operator_name = tracesStatus.operatorName;
      shouldSave = true;
    }

    if (typeof tracesStatus.isValid === 'boolean' && tracesStatus.isValid !== eudrRecord.is_valid) {
      eudrRecord.is_valid = tracesStatus.isValid;
      shouldSave = true;
    }

    if (tracesStatus.riskLevel && tracesStatus.riskLevel !== eudrRecord.risk_level) {
      eudrRecord.risk_level = tracesStatus.riskLevel;
      shouldSave = true;
    }

    if (tracesStatus.registeredDate) {
      const newRegistered = new Date(tracesStatus.registeredDate);
      if (!eudrRecord.trace_registered_date || newRegistered.getTime() !== eudrRecord.trace_registered_date.getTime()) {
        eudrRecord.trace_registered_date = newRegistered;
        shouldSave = true;
      }
    }

    if (tracesStatus.lastUpdated) {
      const newLastUpdated = new Date(tracesStatus.lastUpdated);
      if (!eudrRecord.trace_last_updated || newLastUpdated.getTime() !== eudrRecord.trace_last_updated.getTime()) {
        eudrRecord.trace_last_updated = newLastUpdated;
        shouldSave = true;
      }
    }

    if (shouldSave) {
      await this.eudrRepository.save(eudrRecord);
      this.logger.log(`Updated EUDR record ${eudrRecord.id} with TRACES metadata changes`);
    }

    return { eudrRecord, tracesStatus, riskAssessment };
  }

  /**
   * Evalúa riesgo de cumplimiento basado en validación TRACES
   */
  private assessComplianceRisk(tracesStatus: TraceValidationResponse): {
    level: string;
    issues: string[];
  } {
    let level = 'low';
    const issues: string[] = [];

    if (tracesStatus.complianceStatus === 'rejected') {
      level = 'high';
      issues.push('TRACES marked as rejected - high compliance risk');
    } else if (tracesStatus.complianceStatus === 'pending') {
      level = 'medium';
      issues.push('TRACES verification pending - moderate compliance risk');
    } else if (tracesStatus.complianceStatus === 'unknown') {
      level = 'medium';
      issues.push('TRACES status unknown - cannot validate compliance');
    }

    if (tracesStatus.riskLevel === 'high') {
      level = 'high';
      issues.push('TRACES flagged as high risk operator');
    } else if (tracesStatus.riskLevel === 'medium') {
      if (level === 'low') level = 'medium';
      issues.push('TRACES flagged as medium risk operator');
    }

    if (!tracesStatus.isValid) {
      level = 'high';
      issues.push('Invalid trace according to TRACES');
    }

    if (tracesStatus.issues && tracesStatus.issues.length > 0) {
      issues.push(...tracesStatus.issues);
    }

    return { level, issues };
  }

  /**
   * Sincroniza un registro EUDR con el estado actual en TRACES
   * (Útil para auditoría y reconciliación)
   */
  async syncWithTraces(eudrId: number): Promise<EudrRegistry> {
    const record = await this.eudrRepository.findOne({ where: { id: eudrId } });
    if (!record) {
      throw new Error(`EUDR record not found: ${eudrId}`);
    }

    try {
      const tracesStatus = await this.traceAdapter.validateTrace(record.trace_id);
      let shouldSave = false;

      if (tracesStatus.complianceStatus !== record.compliance_status) {
        record.compliance_status = tracesStatus.complianceStatus;
        shouldSave = true;
      }

      if (tracesStatus.issues && tracesStatus.issues.length > 0) {
        record.issues = tracesStatus.issues.join('; ');
        shouldSave = true;
      }

      if (tracesStatus.eoriNumber && tracesStatus.eoriNumber !== record.eori_number) {
        record.eori_number = tracesStatus.eoriNumber;
        shouldSave = true;
      }

      if (tracesStatus.operatorName && tracesStatus.operatorName !== record.operator_name) {
        record.operator_name = tracesStatus.operatorName;
        shouldSave = true;
      }

      if (typeof tracesStatus.isValid === 'boolean' && tracesStatus.isValid !== record.is_valid) {
        record.is_valid = tracesStatus.isValid;
        shouldSave = true;
      }

      if (tracesStatus.riskLevel && tracesStatus.riskLevel !== record.risk_level) {
        record.risk_level = tracesStatus.riskLevel;
        shouldSave = true;
      }

      if (tracesStatus.registeredDate) {
        const newRegistered = new Date(tracesStatus.registeredDate);
        if (!record.trace_registered_date || newRegistered.getTime() !== record.trace_registered_date.getTime()) {
          record.trace_registered_date = newRegistered;
          shouldSave = true;
        }
      }

      if (tracesStatus.lastUpdated) {
        const newLastUpdated = new Date(tracesStatus.lastUpdated);
        if (!record.trace_last_updated || newLastUpdated.getTime() !== record.trace_last_updated.getTime()) {
          record.trace_last_updated = newLastUpdated;
          shouldSave = true;
        }
      }

      if (shouldSave) {
        await this.eudrRepository.save(record);
        this.logger.log(`Synced EUDR record ${eudrId} with TRACES metadata`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to sync EUDR ${eudrId}: ${error.message}`);
      throw error;
    }

    return record;
  }

  /**
   * Valida si un EORI Number es válido
   */
  isValidEoriNumber(eoriNumber: string): boolean {
    return this.traceAdapter.validateEoriNumber(eoriNumber);
  }
}
