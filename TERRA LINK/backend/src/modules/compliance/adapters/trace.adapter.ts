import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * TRACES API Response Types
 * Reference: https://ec.europa.eu/taxation_customs/business/customs-procedures/general-customs-system_en
 */

export interface TraceValidationResponse {
  traceId: string;
  isValid: boolean;
  eoriNumber?: string;
  operatorName?: string;
  complianceStatus: 'verified' | 'pending' | 'rejected' | 'unknown';
  registeredDate?: string;
  lastUpdated?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  issues?: string[];
}

export interface TraceRegistrationRequest {
  traceId: string;
  eoriNumber: string;
  operatorName: string;
  plotGeometry?: string;
  deforestationStatus: 'compliant' | 'non_compliant' | 'not_applicable';
  certifications?: string[];
}

export interface TraceRegistrationResponse {
  traceId: string;
  registryNumber: string;
  complianceStatus: string;
  timestamp: string;
  confirmationUrl: string;
}

/**
 * TraceAdapter
 * 
 * Adaptador para consumir la API oficial de TRACES (Trade and Reference System)
 * de la Unión Europea para validación de cumplimiento EUDR (European Deforestation Regulation)
 * 
 * En producción, usar credenciales OAuth2 y SSL/TLS mutuamente autenticado.
 * 
 * Referencias:
 * - TRACES: https://ec.europa.eu/taxation_customs/business/customs-procedures/general-customs-system_en
 * - EUDR Regulation (EU) 2023/1115
 */
@Injectable()
export class TraceAdapter {
  private readonly logger = new Logger('TraceAdapter');
  
  // En producción, leer desde env
  private readonly TRACES_API_URL = process.env.TRACES_API_URL || 'https://traces.ec.europa.eu/api/v1';
  private readonly TRACES_API_KEY = process.env.TRACES_API_KEY || 'sandbox-key-placeholder';
  
  constructor() {}

  /**
   * Validar un trace_id contra el sistema TRACES usando fetch nativa
   */
  async validateTrace(traceId: string): Promise<TraceValidationResponse> {
    try {
      this.logger.log(`Validating trace: ${traceId}`);
      
      const url = `${this.TRACES_API_URL}/traces/${traceId}/validate`;
      const response = await this.httpGet<TraceValidationResponse>(url);

      this.logger.log(`Trace ${traceId} validated successfully`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to validate trace ${traceId}: ${error.message}`);
      
      // Si el TRACES no está disponible, retornar estado "unknown" pero no fallar
      // En producción, implementar reintentos con exponential backoff
      if (error.status === 404) {
        throw new HttpException(
          `Trace ${traceId} not found in TRACES system`,
          HttpStatus.NOT_FOUND,
        );
      }
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.logger.warn(`TRACES API unavailable, returning provisional status`);
        return {
          traceId,
          isValid: false,
          complianceStatus: 'unknown',
          issues: ['TRACES API temporarily unavailable - provisional registration'],
        };
      }

      throw new HttpException(
        `TRACES validation failed: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Registra un nuevo trace en el sistema TRACES
   */
  async registerTrace(request: TraceRegistrationRequest): Promise<TraceRegistrationResponse> {
    try {
      this.logger.log(`Registering trace: ${request.traceId}`);
      
      const url = `${this.TRACES_API_URL}/traces/register`;
      const response = await this.httpPost<TraceRegistrationResponse>(url, request);

      this.logger.log(
        `Trace ${request.traceId} registered with registry number: ${response.registryNumber}`,
      );
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to register trace ${request.traceId}: ${error.message}`);
      
      throw new HttpException(
        `TRACES registration failed: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Obtiene el historial de cambios de un trace
   */
  async getTraceHistory(traceId: string): Promise<any[]> {
    try {
      this.logger.log(`Fetching history for trace: ${traceId}`);
      
      const url = `${this.TRACES_API_URL}/traces/${traceId}/history`;
      const response = await this.httpGet<any[]>(url);

      return response;
    } catch (error: any) {
      this.logger.error(`Failed to fetch history for trace ${traceId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Valida un EORI Number (European Operator Registration and Identification)
   * Formato: CC + 12 caracteres (ej: ES1234567890AB)
   */
  validateEoriNumber(eoriNumber: string): boolean {
    const eoriRegex = /^[A-Z]{2}[A-Z0-9]{12}$/;
    return eoriRegex.test(eoriNumber);
  }

  /**
   * Valida formato de trace_id (típicamente UUID v4 o formato similar)
   */
  validateTraceIdFormat(traceId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const customTraceRegex = /^TRACE-\d{4}-\d{6}$/;
    
    return uuidRegex.test(traceId) || customTraceRegex.test(traceId);
  }

  /**
   * Helper: HTTP GET usando fetch nativa
   */
  private async httpGet<T>(url: string, options: any = {}): Promise<T> {
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.TRACES_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: options.timeout || 10000,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Helper: HTTP POST usando fetch nativa
   */
  private async httpPost<T>(url: string, data: any, options: any = {}): Promise<T> {
    const fetchOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.TRACES_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      timeout: options.timeout || 15000,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
