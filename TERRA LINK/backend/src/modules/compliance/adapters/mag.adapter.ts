import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

export interface MagMappingResponse {
  mapSheet: string;
  officialPlotId: string;
  cadastralReference: string;
  boundaryWkt: string;
  status: 'validated' | 'unvalidated' | 'under_review';
  notes?: string;
}

export interface MagMappingQuery {
  officialPlotId: string;
  cadastralReference?: string;
}

@Injectable()
export class MagAdapterService {
  private readonly logger = new Logger('MagAdapter');
  private readonly MAG_API_URL = process.env.MAG_API_URL || 'https://api.mag.gob.ec/v1';
  private readonly MAG_API_TOKEN = process.env.MAG_API_TOKEN || 'sandbox-mag-token';

  constructor() {}

  async fetchMapping(query: MagMappingQuery): Promise<MagMappingResponse> {
    try {
      const url = `${this.MAG_API_URL}/plot-mapping`;
      const response = await this.httpGet<MagMappingResponse>(`${url}?officialPlotId=${encodeURIComponent(query.officialPlotId)}${query.cadastralReference ? `&cadastralReference=${encodeURIComponent(query.cadastralReference)}` : ''}`);
      this.logger.log(`Fetched MAG mapping for plot: ${query.officialPlotId}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to fetch MAG mapping: ${error.message}`);
      throw new HttpException(`MAG retrieval failed: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  normalizeMappingResponse(response: MagMappingResponse) {
    return {
      officialPlotId: response.officialPlotId,
      cadastralReference: response.cadastralReference,
      boundaryWkt: response.boundaryWkt,
      status: response.status,
      notes: response.notes,
    };
  }

  private async httpGet<T>(url: string, options: any = {}): Promise<T> {
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.MAG_API_TOKEN}`,
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
}
