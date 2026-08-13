import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot } from '../../../entities/plot.entity';
import { SatelliteValidation } from '../../../entities/satellite-validation.entity';
import { SatelliteAdapterService, SatelliteValidationQuery, SatelliteValidationResponse } from './satellite.adapter';

@Injectable()
export class SatelliteValidationService {
  private readonly logger = new Logger('SatelliteValidationService');

  constructor(
    private readonly satelliteAdapter: SatelliteAdapterService,
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
    @InjectRepository(SatelliteValidation)
    private readonly validationRepository: Repository<SatelliteValidation>,
  ) {}

  async validatePlot(plotId: number, fromDate: string, toDate: string) {
    const plot = await this.plotRepository.findOne({ where: { id: plotId } });
    if (!plot) {
      throw new NotFoundException(`Plot with id ${plotId} not found`);
    }

    const query: SatelliteValidationQuery = {
      plotId: plot.id.toString(),
      geometryWkt: plot.geom,
      fromDate,
      toDate,
    };

    const response = await this.satelliteAdapter.validatePlot(query);
    return this.persistSatelliteValidation(plot.id, response, fromDate, toDate);
  }

  private async persistSatelliteValidation(
    plotId: number,
    response: SatelliteValidationResponse,
    fromDate: string,
    toDate: string,
  ) {
    const normalized = this.satelliteAdapter.normalizeValidation(response);

    const entity = this.validationRepository.create({
      plot_id: plotId,
      ndvi: normalized.ndvi,
      forest_cover_percentage: normalized.forestCoverPercentage,
      recent_deforestation_detected: normalized.recentDeforestationDetected,
      deforestation_review_date: normalized.deforestationReviewDate,
      source: normalized.source,
      details: normalized.details,
      range_start: new Date(fromDate),
      range_end: new Date(toDate),
    });

    const saved = await this.validationRepository.save(entity);
    this.logger.log(`Saved satellite validation for plot ${plotId} at ${saved.id}`);
    return saved;
  }
}
