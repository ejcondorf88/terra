import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlotService } from './plot.service';
import { GeoService } from '../geo/geo.service';
import { Plot } from '../../entities/plot.entity';

describe('PlotService', () => {
  let service: PlotService;
  let plotRepository: any;
  let geoService: any;

  const mockGeom = {
    type: 'Polygon',
    coordinates: [
      [
        [-73.97, 40.77],
        [-73.97, 40.78],
        [-73.96, 40.78],
        [-73.96, 40.77],
        [-73.97, 40.77],
      ],
    ],
  };

  beforeEach(async () => {
    plotRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    };

    geoService = {
      validateParcel: jest.fn().mockResolvedValue({
        valid: true,
        areaHectares: 100,
        message: 'Parcel validated successfully',
        geometry: mockGeom,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlotService,
        {
          provide: getRepositoryToken(Plot),
          useValue: plotRepository,
        },
        {
          provide: GeoService,
          useValue: geoService,
        },
      ],
    }).compile();

    service = module.get<PlotService>(PlotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPlot', () => {
    it('should create a plot with valid geometry', async () => {
      const createDto = {
        name: 'Farm A',
        owner_id: 1,
        geom: mockGeom,
        tenant_id: 1,
      };

      plotRepository.create.mockReturnValue(createDto);
      plotRepository.save.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.createPlot(
        createDto.name,
        createDto.owner_id,
        createDto.geom,
        createDto.tenant_id
      );

      expect(geoService.validateParcel).toHaveBeenCalledWith(mockGeom);
      expect(plotRepository.create).toHaveBeenCalled();
      expect(plotRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...createDto });
    });

    it('should throw error if geometry is invalid', async () => {
      geoService.validateParcel.mockResolvedValueOnce({
        valid: false,
        message: 'Invalid polygon',
      });

      await expect(
        service.createPlot('Farm B', 2, mockGeom)
      ).rejects.toThrow('Invalid geometry');
    });
  });

  describe('findPlot', () => {
    it('should find plot by id', async () => {
      const plot = { id: 1, name: 'Farm A' };
      plotRepository.findOne.mockResolvedValue(plot);

      const result = await service.findPlot(1);

      expect(result).toEqual(plot);
    });

    it('should throw NotFoundException when plot not found', async () => {
      plotRepository.findOne.mockResolvedValue(null);

      await expect(service.findPlot(999)).rejects.toThrow('not found');
    });
  });

  describe('findPlotsByOwner', () => {
    it('should return plots for owner', async () => {
      const plots = [{ id: 1, owner_id: 1 }, { id: 2, owner_id: 1 }];
      plotRepository.find.mockResolvedValue(plots);

      const result = await service.findPlotsByOwner(1);

      expect(result).toEqual(plots);
      expect(plotRepository.find).toHaveBeenCalledWith({ where: { owner_id: 1 } });
    });
  });
});
