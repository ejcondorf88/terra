import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot } from '../../entities/plot.entity';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class PlotService {
  constructor(
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
    private readonly geoService: GeoService,
  ) {}

  async createPlot(
    name: string,
    ownerId: number,
    geom: any,
    tenantId?: number,
    certification?: string,
  ) {
    // Validate geometry first
    const validation = await this.geoService.validateParcel(geom);
    if (!validation.valid) {
      throw new Error(`Invalid geometry: ${validation.message}`);
    }

    // Create WKT from GeoJSON
    const wkt = this.geoJsonToWkt(geom);

    const plot = this.plotRepository.create({
      name,
      owner_id: ownerId,
      geom: wkt,
      tenant_id: tenantId,
      certification: certification ?? undefined,
    });

    return this.plotRepository.save(plot);
  }

  async findPlot(id: number) {
    const plot = await this.plotRepository.findOne({ where: { id } });
    if (!plot) {
      throw new NotFoundException(`Plot with id ${id} not found`);
    }
    return plot;
  }

  async findPlotsByOwner(ownerId: number) {
    return this.plotRepository.find({ where: { owner_id: ownerId } });
  }

  async findPlotsByTenant(tenantId: number) {
    return this.plotRepository.find({ where: { tenant_id: tenantId } });
  }

  async updatePlot(id: number, data: Partial<Plot>) {
    const plot = await this.findPlot(id);
    Object.assign(plot, data);
    return this.plotRepository.save(plot);
  }

  private geoJsonToWkt(geoJson: any): string {
    const coordinates = geoJson.coordinates[0];
    const wktCoords = coordinates.map((coord: number[]) => `${coord[0]} ${coord[1]}`).join(', ');
    return `SRID=4326;POLYGON((${wktCoords}))`;
  }
}
