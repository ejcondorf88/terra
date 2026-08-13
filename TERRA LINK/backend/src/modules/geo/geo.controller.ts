import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { GeoService } from './geo.service';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';

@Controller('geo')
@UseGuards(JwtAuthGuard, RbacGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post('validate')
  @Roles('productor', 'admin')
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
