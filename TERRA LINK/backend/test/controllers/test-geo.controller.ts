import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TestGeoService } from '../services/test-geo.service';

@Controller('geo')
export class TestGeoController {
  constructor(private readonly geoService: TestGeoService) {}

  @Post('validate')
  async validateParcel(@Body() body: { geojson: any }) {
    try {
      if (!body.geojson) {
        throw new HttpException('GeoJSON is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.geoService.validateParcel(body.geojson);
      return result;
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Validation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
