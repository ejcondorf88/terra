import { Injectable } from '@nestjs/common';

@Injectable()
export class TestGeoService {
  async validateParcel(geojson: any) {
    // Simple mock validation
    if (geojson && geojson.type) {
      return {
        valid: true,
        area: 1000,
        message: 'GeoJSON validated successfully'
      };
    }
    return {
      valid: false,
      message: 'Invalid GeoJSON'
    };
  }
}
