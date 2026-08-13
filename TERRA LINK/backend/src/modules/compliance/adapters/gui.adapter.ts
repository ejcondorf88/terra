import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

export interface GuiPlotResponse {
  guiId: string;
  producerName: string;
  plotCode: string;
  geoJson: string;
  certifications: string[];
  validFrom: string;
  validUntil?: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
}

export interface GuiPlotQuery {
  guiId: string;
  plotCode?: string;
}

@Injectable()
export class GuiAdapterService {
  private readonly logger = new Logger('GuiAdapter');
  private readonly GUI_API_URL = process.env.GUI_API_URL || 'https://api.agrocalidad.gob.ec/gui';
  private readonly GUI_API_KEY = process.env.GUI_API_KEY || 'sandbox-gui-key';

  constructor() {}

  async fetchPlot(query: GuiPlotQuery): Promise<GuiPlotResponse> {
    try {
      const url = `${this.GUI_API_URL}/plots/search`;
      const response = await this.httpPost<GuiPlotResponse>(url, query);
      this.logger.log(`Fetched GUIA plot data for query: ${JSON.stringify(query)}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to fetch GUIA plot: ${error.message}`);
      throw new HttpException(`GUIA retrieval failed: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  validateGuiId(guiId: string): boolean {
    const regex = /^[A-Z0-9-]{8,32}$/;
    return regex.test(guiId);
  }

  normalizePlotResponse(response: GuiPlotResponse) {
    return {
      plotId: response.plotCode,
      producerName: response.producerName,
      geoJson: response.geoJson,
      certifications: response.certifications,
      status: response.status,
      validFrom: response.validFrom ? new Date(response.validFrom) : undefined,
      validUntil: response.validUntil ? new Date(response.validUntil) : undefined,
    };
  }

  private async httpPost<T>(url: string, data: any, options: any = {}): Promise<T> {
    const fetchOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.GUI_API_KEY}`,
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
