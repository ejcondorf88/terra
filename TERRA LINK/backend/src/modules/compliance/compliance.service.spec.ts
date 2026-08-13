import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { TraceService } from './services/trace.service';
import { SatelliteAdapterService } from './services/satellite.adapter';
import { Certification } from '../../entities/certification.entity';
import { EudrRegistry } from '../../entities/eudr-registry.entity';
import { EsgReport } from '../../entities/esg-report.entity';
import { Plot } from '../../entities/plot.entity';
import { SatelliteValidation } from '../../entities/satellite-validation.entity';
import { IoTService } from '../iot/iot.service';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let certificationRepository: any;
  let eudrRepository: any;
  let esgRepository: any;
  let plotRepository: any;
  let satelliteValidationRepository: any;
  let traceService: any;
  let satelliteAdapter: any;
  let iotService: any;

  beforeEach(async () => {
    certificationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    eudrRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    esgRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    plotRepository = {
      findOne: jest.fn(),
    };
    satelliteValidationRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    traceService = {
      registerOperatorEudr: jest.fn(),
      getTraceComplianceStatus: jest.fn(),
      syncWithTraces: jest.fn(),
      isValidEoriNumber: jest.fn(),
    };
    satelliteAdapter = {
      validatePlot: jest.fn(),
    };
    iotService = {
      getAlerts: jest.fn(),
      getReadingsForPlot: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        {
          provide: getRepositoryToken(Certification),
          useValue: certificationRepository,
        },
        {
          provide: getRepositoryToken(EudrRegistry),
          useValue: eudrRepository,
        },
        {
          provide: getRepositoryToken(EsgReport),
          useValue: esgRepository,
        },
        {
          provide: getRepositoryToken(Plot),
          useValue: plotRepository,
        },
        {
          provide: getRepositoryToken(SatelliteValidation),
          useValue: satelliteValidationRepository,
        },
        {
          provide: TraceService,
          useValue: traceService,
        },
        {
          provide: SatelliteAdapterService,
          useValue: satelliteAdapter,
        },
        {
          provide: IoTService,
          useValue: iotService,
        },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should create a certification', async () => {
    const dto = { name: 'GlobalGAP', standard: 'GAP', plot_id: 1 };
    certificationRepository.create.mockReturnValue(dto);
    certificationRepository.save.mockResolvedValue({ id: 1, ...dto });

    const result = await service.createCertification(dto);

    expect(certificationRepository.create).toHaveBeenCalledWith(dto);
    expect(certificationRepository.save).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should find certification by id', async () => {
    const certification = { id: 1, name: 'GlobalGAP', standard: 'GAP' };
    certificationRepository.findOne.mockResolvedValue(certification);

    const result = await service.findCertification(1);

    expect(result).toEqual(certification);
  });

  it('should throw when certification not found', async () => {
    certificationRepository.findOne.mockResolvedValue(null);

    await expect(service.findCertification(1)).rejects.toThrow(NotFoundException);
  });

  it('should return all certifications', async () => {
    const certifications = [{ id: 1 }, { id: 2 }];
    certificationRepository.find.mockResolvedValue(certifications);

    const result = await service.findAllCertifications();

    expect(result).toEqual(certifications);
  });

  it('should register an EUDR registry record', async () => {
    const dto = { trace_id: '550e8400-e29b-41d4-a716-446655440000', registry_number: 'EUDR-0001', plot_id: 2 };
    const mockResult = { id: 1, ...dto };
    const mockValidationDetails = {
      traceId: dto.trace_id,
      isValid: true,
      complianceStatus: 'verified',
    };
    
    traceService.registerOperatorEudr.mockResolvedValue({
      ...mockResult,
      validationDetails: mockValidationDetails,
    });

    const result = await service.registerEudr(dto);

    expect(traceService.registerOperatorEudr).toHaveBeenCalledWith(dto, undefined);
    expect(result).toEqual(mockResult);
  });

  it('should get EUDR status by trace id', async () => {
    const registry = { id: 1, trace_id: '550e8400-e29b-41d4-a716-446655440000' };
    const mockTracesStatus = {
      traceId: registry.trace_id,
      isValid: true,
      complianceStatus: 'verified',
    };
    const mockRiskAssessment = { level: 'low', issues: [] };
    
    eudrRepository.findOne.mockResolvedValue(registry);
    traceService.getTraceComplianceStatus.mockResolvedValue({
      eudrRecord: registry,
      tracesStatus: mockTracesStatus,
      riskAssessment: mockRiskAssessment,
    });

    const result = await service.getEudrStatus(registry.trace_id);

    expect(eudrRepository.findOne).toHaveBeenCalled();
    expect(result).toHaveProperty('tracesValidation');
    expect(result).toHaveProperty('riskAssessment');
  });

  it('should throw when EUDR record is not found', async () => {
    eudrRepository.findOne.mockResolvedValue(null);

    await expect(service.getEudrStatus('missing')).rejects.toThrow(NotFoundException);
  });

  it('should sync an EUDR registry record with TRACES', async () => {
    const registry = { id: 1, trace_id: 'TRACE-2026-000042' };
    const syncedRecord = { id: 1, trace_id: 'TRACE-2026-000042', compliance_status: 'verified' };

    eudrRepository.findOne.mockResolvedValue(registry);
    traceService.syncWithTraces.mockResolvedValue(syncedRecord);

    const result = await service.syncEudr(registry.trace_id);

    expect(eudrRepository.findOne).toHaveBeenCalledWith({
      where: { trace_id: registry.trace_id },
    });
    expect(traceService.syncWithTraces).toHaveBeenCalledWith(registry.id);
    expect(result).toEqual(syncedRecord);
  });

  it('should throw when syncing missing EUDR record', async () => {
    eudrRepository.findOne.mockResolvedValue(null);

    await expect(service.syncEudr('TRACE-2026-999999')).rejects.toThrow(NotFoundException);
    expect(traceService.syncWithTraces).not.toHaveBeenCalled();
  });

  it('should validate satellite plot and persist the result', async () => {
    const dto = {
      plotId: '1',
      coordinates: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
      },
      dateRange: { from: '2025-01-01', to: '2025-01-30' },
    };
    const plot = { id: 1 };
    const satelliteResponse = {
      plotId: '1',
      ndvi: 0.85,
      forestCoverPercentage: 92.5,
      recentDeforestationDetected: false,
      source: 'sentinel',
      details: 'Healthy vegetation',
    };

    plotRepository.findOne.mockResolvedValue(plot);
    satelliteAdapter.validatePlot.mockResolvedValue(satelliteResponse);
    iotService.getReadingsForPlot.mockResolvedValue({ readings: [], climate: [] });
    iotService.getAlerts.mockResolvedValue([]);
    satelliteValidationRepository.create.mockReturnValue(satelliteResponse);
    satelliteValidationRepository.save.mockResolvedValue({ id: 1, ...satelliteResponse, plot_id: 1 });

    const result = await service.validateSatellite(dto as any);

    expect(plotRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(satelliteAdapter.validatePlot).toHaveBeenCalledWith(dto.coordinates, dto.dateRange);
    expect(satelliteValidationRepository.create).toHaveBeenCalledWith({
      plot_id: 1,
      ndvi: satelliteResponse.ndvi,
      forest_cover_percentage: satelliteResponse.forestCoverPercentage,
      recent_deforestation_detected: satelliteResponse.recentDeforestationDetected,
      deforestation_review_date: undefined,
      source: satelliteResponse.source,
      details: satelliteResponse.details,
      range_start: new Date(dto.dateRange.from),
      range_end: new Date(dto.dateRange.to),
    });
    expect(result).toEqual({
      id: 1,
      ...satelliteResponse,
      plot_id: 1,
      iotContext: {
        readingCount: 0,
        climateCount: 0,
        latestReading: null,
        activeAlerts: [],
      },
    });
  });

  it('should generate an ESG report with IoT alert context including severity and recurrence', async () => {
    const baseTime = new Date();
    const thirtyDaysAgo = new Date(baseTime.getTime() - 30 * 24 * 60 * 60 * 1000 - 1000);
    const dto = { plot_id: 3, category: 'water', score: 85, details: 'Baseline review' };
    const alerts = [
      { id: 1, type: 'humidity', severity: 'critical', resolved: false, createdAt: baseTime },
      { id: 2, type: 'humidity', severity: 'high', resolved: false, createdAt: baseTime },
      { id: 3, type: 'ndvi', severity: 'medium', resolved: false, createdAt: thirtyDaysAgo },
    ];
    const expectedDetails = 'Baseline review\nIoT alerts: 3 unresolved (1 critical, 1 high, 1 medium, 0 low) | Recurring: humidity (30-day window). Recent (30d): 2';
    const savedReport = { id: 1, ...dto, details: expectedDetails };

    esgRepository.create.mockReturnValue(dto);
    esgRepository.save.mockResolvedValue(savedReport);
    iotService.getAlerts.mockResolvedValue(alerts);

    const result = await service.generateEsgReport(dto as any);

    expect(iotService.getAlerts).toHaveBeenCalledWith({ plotId: 3, unresolvedOnly: true });
    expect(esgRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      ...dto,
      details: expectedDetails,
    }));
    expect(result).toEqual(savedReport);
  });

  it('should return an alerts dashboard summary from IoT alerts', async () => {
    const tenantId = 5;
    const alerts = [
      { id: 1, type: 'humidity', severity: 'high', resolved: false, createdAt: new Date() },
      { id: 2, type: 'ph', severity: 'medium', resolved: false, createdAt: new Date() },
      { id: 3, type: 'humidity', severity: 'high', resolved: false, createdAt: new Date() },
    ];

    iotService.getAlerts.mockResolvedValue(alerts);

    const result = await service.buildAlertsDashboard(tenantId);

    expect(iotService.getAlerts).toHaveBeenCalledWith({ tenantId, unresolvedOnly: true });
    expect(result.totalUnresolved).toBe(3);
    expect(result.bySeverity).toEqual({ critical: 0, high: 2, medium: 1, low: 0 });
    expect(result.byType).toEqual(expect.objectContaining({ humidity: 2, ph: 1 }));
    expect(result.recurringTypes).toEqual(['humidity']);
    expect(result.summaryText).toContain('IoT alerts: 3 unresolved');
  });

  it('should find ESG report by id', async () => {
    const report = { id: 1, category: 'water', score: 90 };
    esgRepository.findOne.mockResolvedValue(report);

    const result = await service.findEsgReport(1);

    expect(result).toEqual(report);
  });

  it('should throw when ESG report is not found', async () => {
    esgRepository.findOne.mockResolvedValue(null);

    await expect(service.findEsgReport(1)).rejects.toThrow(NotFoundException);
  });
});
