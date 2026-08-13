import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot } from '../../entities/plot.entity';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Plot)
    private plotRepository: Repository<Plot>,
  ) {}

  async validateParcel(geoJson: any) {
    try {
      // Validate GeoJSON structure
      if (!geoJson || geoJson.type !== 'Polygon') {
        return {
          valid: false,
          message: 'Invalid GeoJSON: must be a Polygon',
        };
      }

      // Check if coordinates are valid
      const coordinates = geoJson.coordinates[0];
      if (!coordinates || coordinates.length < 4) {
        return {
          valid: false,
          message: 'Invalid polygon: must have at least 4 coordinates',
        };
      }

      // Calculate area using PostGIS
      const wkt = this.geoJsonToWkt(geoJson);
      const areaResult = await this.plotRepository.query(
        `SELECT ST_Area(ST_GeomFromText($1, 4326)) as area`,
        [wkt]
      );

      const areaSqMeters = parseFloat(areaResult[0].area);
      const areaHectares = areaSqMeters / 10000;

      return {
        valid: true,
        areaHectares: Math.round(areaHectares * 100) / 100,
        message: 'Parcel validated successfully',
        geometry: geoJson,
      };
    } catch (error) {
      return {
        valid: false,
        message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async calculateCoverage(geoJson: any) {
    const validation = await this.validateParcel(geoJson);
    if (!validation.valid) {
      return validation;
    }

    // Additional geospatial calculations can be added here
    return {
      ...validation,
      coverage: 100, // Placeholder for satellite coverage calculation
    };
  }

  private geoJsonToWkt(geoJson: any): string {
    const coordinates = geoJson.coordinates[0];
    const wktCoords = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
    return `POLYGON((${wktCoords}))`;
  }
}
