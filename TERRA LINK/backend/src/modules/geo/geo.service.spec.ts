import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoService } from './geo.service';
import { Plot } from '../../entities/plot.entity';

describe('GeoService', () => {
  let service: GeoService;
  let plotRepository: Repository<Plot>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeoService,
        {
          provide: getRepositoryToken(Plot),
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GeoService>(GeoService);
    plotRepository = module.get<Repository<Plot>>(getRepositoryToken(Plot));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateParcel', () => {
    it('should validate a valid polygon', async () => {
      const mockQuery = jest.spyOn(plotRepository, 'query').mockResolvedValue([{ area: 10000 }]);

      const geoJson = {
        type: 'Polygon',
        coordinates: [[[ -79.4, -2.1 ], [ -79.3, -2.1 ], [ -79.3, -2.0 ], [ -79.4, -2.0 ], [ -79.4, -2.1 ]]]
      };

      const result = await service.validateParcel(geoJson);

      expect(result.valid).toBe(true);
      expect(result.areaHectares).toBe(1);
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should reject invalid geojson', async () => {
      const result = await service.validateParcel({ type: 'Point', coordinates: [0, 0] });

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid GeoJSON');
    });
  });
});
