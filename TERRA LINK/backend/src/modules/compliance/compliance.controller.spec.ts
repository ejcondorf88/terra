import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

describe('ComplianceController', () => {
  let controller: ComplianceController;
  let service: ComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [
        {
          provide: ComplianceService,
          useValue: {
            registerEudr: jest.fn(),
            getEudrStatus: jest.fn(),
            syncEudr: jest.fn(),
            validateSatellite: jest.fn(),
            createCertification: jest.fn(),
            findCertification: jest.fn(),
            findAllCertifications: jest.fn(),
            generateEsgReport: jest.fn(),
            findEsgReport: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ComplianceController>(ComplianceController);
    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register EUDR', async () => {
    const dto = {
      trace_id: 'TRACE-2026-000042',
      registry_number: 'EUDR-0001',
      plot_id: 42,
      compliance_status: 'pending',
      source: 'TRACES System',
    };
    const expected = { id: 1, ...dto };
    jest.spyOn(service, 'registerEudr').mockResolvedValue(expected as any);

    const result = await controller.registerEudr(dto as any);

    expect(result).toBe(expected);
    expect(service.registerEudr).toHaveBeenCalledWith(dto);
  });

  it('should get EUDR status by traceId', async () => {
    const traceId = 'TRACE-2026-000042';
    const expected = { trace_id: traceId, compliance_status: 'verified' };
    jest.spyOn(service, 'getEudrStatus').mockResolvedValue(expected as any);

    const result = await controller.getEudrStatus(traceId);

    expect(result).toBe(expected);
    expect(service.getEudrStatus).toHaveBeenCalledWith(traceId);
  });

  it('should sync EUDR by traceId', async () => {
    const traceId = 'TRACE-2026-000042';
    const expected = { trace_id: traceId, compliance_status: 'verified' };
    jest.spyOn(service, 'syncEudr').mockResolvedValue(expected as any);

    const result = await controller.syncEudr(traceId);

    expect(result).toBe(expected);
    expect(service.syncEudr).toHaveBeenCalledWith(traceId);
  });

  it('should validate satellite plot', async () => {
    const dto = {
      plotId: '1',
      coordinates: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
      },
      dateRange: { from: '2025-01-01', to: '2025-01-30' },
    };
    const expected = { id: 1, plot_id: 1, ndvi: 0.85 };
    jest.spyOn(service, 'validateSatellite').mockResolvedValue(expected as any);

    const result = await controller.validateSatellite(dto as any);

    expect(result).toBe(expected);
    expect(service.validateSatellite).toHaveBeenCalledWith(dto);
  });
});
