import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { SatelliteAdapterService, SatelliteValidationResponse } from './satellite.adapter';

describe('SatelliteAdapterService', () => {
  let service: SatelliteAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatelliteAdapterService],
    }).compile();

    service = module.get<SatelliteAdapterService>(SatelliteAdapterService);
    jest.clearAllMocks();
  });

  describe('validatePlot', () => {
    it('should validate plot with geojson and date range', async () => {
      const response: SatelliteValidationResponse = {
        plotId: 'test',
        ndvi: 0.76,
        forestCoverPercentage: 82.5,
        recentDeforestationDetected: false,
        source: 'sentinel',
        details: 'Clear vegetation coverage',
      };

      (global.fetch as jest.Mock) = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await service.validatePlot(
        {
          type: 'Polygon',
          coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
        },
        { from: '2025-01-01', to: '2025-01-30' },
      );

      expect(result).toEqual(response);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should throw HTTP exception for invalid geojson', async () => {
      await expect(
        service.validatePlot({ type: 'Point', coordinates: [0, 0] }, { from: '2025-01-01', to: '2025-01-30' }),
      ).rejects.toThrow(HttpException);
    });
  });
});
