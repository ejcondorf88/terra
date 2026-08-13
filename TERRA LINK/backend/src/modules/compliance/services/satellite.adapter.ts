import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

export interface SatelliteValidationResponse {
  plotId: string;
  ndvi: number;
  forestCoverPercentage: number;
  recentDeforestationDetected: boolean;
  deforestationReviewDate?: string;
  source: 'sentinel' | 'landsat' | 'custom';
  details?: string;
}

export interface SatelliteValidationQuery {
  plotId: string;
  geometryWkt: string;
  fromDate: string;
  toDate: string;
}

@Injectable()
export class SatelliteAdapterService {
  private readonly logger = new Logger('SatelliteAdapter');
  private readonly SATELLITE_API_URL = process.env.SATELLITE_API_URL || 'https://api.satelliteprovider.local/v1';
  private readonly SATELLITE_API_KEY = process.env.SATELLITE_API_KEY || 'sandbox-satellite-key';

  constructor() {}

  async validatePlot(geometry: any, dateRange?: { from: string; to: string }): Promise<SatelliteValidationResponse> {
    const query: SatelliteValidationQuery = {
      plotId: 'satellite-validation',
      geometryWkt: this.geoJsonToWkt(geometry),
      fromDate: dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      toDate: dateRange?.to || new Date().toISOString(),
    };

    try {
      const url = `${this.SATELLITE_API_URL}/validate-plot`;
      const response = await this.httpPost<SatelliteValidationResponse>(url, query);
      this.logger.log(`Fetched satellite validation for plot ${query.plotId}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Satellite validation failed: ${error.message}`);
      throw new HttpException(`Satellite validation failed: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  private geoJsonToWkt(geoJson: any): string {
    if (!geoJson || !geoJson.type || !geoJson.coordinates) {
      throw new HttpException('Invalid GeoJSON object for satellite validation', HttpStatus.BAD_REQUEST);
    }

    const coordinates = geoJson.coordinates[0];
    if (!Array.isArray(coordinates) || coordinates.length < 4) {
      throw new HttpException('GeoJSON polygon must include at least 4 coordinates', HttpStatus.BAD_REQUEST);
    }

    const wktCoords = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
    return `POLYGON((${wktCoords}))`;
  }

  normalizeValidation(response: SatelliteValidationResponse) {
    return {
      plotId: response.plotId,
      ndvi: response.ndvi,
      forestCoverPercentage: response.forestCoverPercentage,
      recentDeforestationDetected: response.recentDeforestationDetected,
      deforestationReviewDate: response.deforestationReviewDate ? new Date(response.deforestationReviewDate) : undefined,
      source: response.source,
      details: response.details,
    };
  }

  private async httpPost<T>(url: string, data: any, options: any = {}): Promise<T> {
    const fetchOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.SATELLITE_API_KEY}`,
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
