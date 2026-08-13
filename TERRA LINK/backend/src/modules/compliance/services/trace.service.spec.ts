import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { TraceService } from './trace.service';
import { TraceAdapter, TraceValidationResponse } from '../adapters/trace.adapter';
import { EudrRegistry } from '../../../entities/eudr-registry.entity';
import { RegisterEudrDto } from '../dto/register-eudr.dto';

describe('TraceService - TRACES API Integration', () => {
  let service: TraceService;
  let traceAdapter: TraceAdapter;
  let eudrRepository: any;

  const mockEudrRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTraceAdapter = {
    validateTrace: jest.fn(),
    registerTrace: jest.fn(),
    getTraceHistory: jest.fn(),
    validateEoriNumber: jest.fn(),
    validateTraceIdFormat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TraceService,
        {
          provide: TraceAdapter,
          useValue: mockTraceAdapter,
        },
        {
          provide: getRepositoryToken(EudrRegistry),
          useValue: mockEudrRepository,
        },
      ],
    }).compile();

    service = module.get<TraceService>(TraceService);
    traceAdapter = module.get<TraceAdapter>(TraceAdapter);
    eudrRepository = module.get(getRepositoryToken(EudrRegistry));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerOperatorEudr', () => {
    const validDto: RegisterEudrDto = {
      trace_id: '550e8400-e29b-41d4-a716-446655440000',
      registry_number: 'EUDR-2026-001',
      compliance_status: 'pending',
      source: 'TRACES System',
      plot_id: 42,
      tenant_id: 1,
    };

    const mockValidationResponse: TraceValidationResponse = {
      traceId: validDto.trace_id,
      isValid: true,
      eoriNumber: 'ES1234567890AB',
      operatorName: 'Agro Operator S.L.',
      complianceStatus: 'verified',
      registeredDate: '2026-06-23T00:00:00Z',
      lastUpdated: '2026-06-23T12:00:00Z',
      riskLevel: 'low',
      issues: [],
    };

    it('should successfully register operator with valid trace_id', async () => {
      mockTraceAdapter.validateTraceIdFormat.mockReturnValue(true);
      mockEudrRepository.findOne.mockResolvedValue(null);
      mockTraceAdapter.validateTrace.mockResolvedValue(mockValidationResponse);
      mockEudrRepository.create.mockReturnValue(validDto);
      mockEudrRepository.save.mockResolvedValue({ id: 1, ...validDto });

      const result = await service.registerOperatorEudr(validDto, 1);

      expect(mockTraceAdapter.validateTraceIdFormat).toHaveBeenCalledWith(validDto.trace_id);
      expect(mockEudrRepository.findOne).toHaveBeenCalled();
      expect(mockTraceAdapter.validateTrace).toHaveBeenCalledWith(validDto.trace_id);
      expect(mockEudrRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('validationDetails');
      expect(result.validationDetails.complianceStatus).toBe('verified');
    });

    it('should reject invalid trace_id format', async () => {
      mockTraceAdapter.validateTraceIdFormat.mockReturnValue(false);

      await expect(service.registerOperatorEudr(validDto, 1)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockTraceAdapter.validateTraceIdFormat).toHaveBeenCalledWith(validDto.trace_id);
      expect(mockEudrRepository.findOne).not.toHaveBeenCalled();
    });

    it('should reject duplicate trace_id registration', async () => {
      mockTraceAdapter.validateTraceIdFormat.mockReturnValue(true);
      mockEudrRepository.findOne.mockResolvedValue({ id: 1, trace_id: validDto.trace_id });

      await expect(service.registerOperatorEudr(validDto, 1)).rejects.toThrow(
        ConflictException,
      );

      expect(mockEudrRepository.findOne).toHaveBeenCalled();
      expect(mockTraceAdapter.validateTrace).not.toHaveBeenCalled();
    });

    it('should handle TRACES API unavailability gracefully', async () => {
      mockTraceAdapter.validateTraceIdFormat.mockReturnValue(true);
      mockEudrRepository.findOne.mockResolvedValue(null);
      mockTraceAdapter.validateTrace.mockRejectedValue(
        new Error('TRACES API timeout'),
      );
      mockEudrRepository.create.mockReturnValue(validDto);
      mockEudrRepository.save.mockResolvedValue({ id: 1, ...validDto });

      const result = await service.registerOperatorEudr(validDto, 1);

      expect(result.validationDetails.complianceStatus).toBe('unknown');
      expect(result.validationDetails.issues).toContainEqual(
        expect.stringContaining('TRACES API'),
      );
    });

    it('should enrich record with TRACES operator name and metadata', async () => {
      mockTraceAdapter.validateTraceIdFormat.mockReturnValue(true);
      mockEudrRepository.findOne.mockResolvedValue(null);
      mockTraceAdapter.validateTrace.mockResolvedValue(mockValidationResponse);
      mockEudrRepository.create.mockReturnValue(validDto);
      const savedRecord = { id: 1, ...validDto, trace_url: expect.any(String) };
      mockEudrRepository.save.mockResolvedValue(savedRecord);

      await service.registerOperatorEudr(validDto, 1);

      const createCall = mockEudrRepository.create.mock.calls[0][0];
      expect(createCall).toHaveProperty('compliance_status', 'verified');
      expect(createCall).toHaveProperty('trace_url');
      expect(createCall).toHaveProperty('eori_number', 'ES1234567890AB');
      expect(createCall).toHaveProperty('operator_name', 'Agro Operator S.L.');
      expect(createCall).toHaveProperty('is_valid', true);
      expect(createCall).toHaveProperty('risk_level', 'low');
      expect(createCall.trace_registered_date).toEqual(new Date('2026-06-23T00:00:00Z'));
      expect(createCall.trace_last_updated).toEqual(new Date('2026-06-23T12:00:00Z'));
    });
  });

  describe('getTraceComplianceStatus', () => {
    const traceId = '550e8400-e29b-41d4-a716-446655440000';
    const mockEudrRecord: EudrRegistry = {
      id: 1,
      trace_id: traceId,
      registry_number: 'EUDR-2026-001',
      compliance_status: 'verified',
      issues: '',
      plot_id: 10,
      tenant_id: 1,
      source: 'TRACES',
      trace_url: '',
      created_at: new Date(),
      updated_at: new Date(),
      plot: undefined as any,
    };

    const mockTracesStatus: TraceValidationResponse = {
      traceId,
      isValid: true,
      complianceStatus: 'verified',
      riskLevel: 'low',
      issues: [],
    };

    it('should retrieve compliance status from TRACES', async () => {
      mockEudrRepository.findOne.mockResolvedValue(mockEudrRecord);
      mockTraceAdapter.validateTrace.mockResolvedValue(mockTracesStatus);
      mockEudrRepository.save.mockResolvedValue(mockEudrRecord);

      const result = await service.getTraceComplianceStatus(traceId, 1);

      expect(result).toHaveProperty('eudrRecord');
      expect(result).toHaveProperty('tracesStatus');
      expect(result).toHaveProperty('riskAssessment');
      expect(result.riskAssessment.level).toBe('low');
    });

    it('should assess high risk for rejected compliance status', async () => {
      mockEudrRepository.findOne.mockResolvedValue(mockEudrRecord);
      const rejectedStatus: TraceValidationResponse = {
        ...mockTracesStatus,
        complianceStatus: 'rejected',
        isValid: false,
      };
      mockTraceAdapter.validateTrace.mockResolvedValue(rejectedStatus);

      const result = await service.getTraceComplianceStatus(traceId, 1);

      expect(result.riskAssessment.level).toBe('high');
      expect(result.riskAssessment.issues).toContainEqual(expect.stringContaining('rejected'));
    });

    it('should assess medium risk for pending status', async () => {
      mockEudrRepository.findOne.mockResolvedValue(mockEudrRecord);
      const pendingStatus: TraceValidationResponse = {
        ...mockTracesStatus,
        complianceStatus: 'pending',
      };
      mockTraceAdapter.validateTrace.mockResolvedValue(pendingStatus);

      const result = await service.getTraceComplianceStatus(traceId, 1);

      expect(result.riskAssessment.level).toBe('medium');
      expect(result.riskAssessment.issues).toContainEqual(expect.stringContaining('pending'));
    });

    it('should handle missing EUDR record', async () => {
      mockEudrRepository.findOne.mockResolvedValue(null);

      await expect(service.getTraceComplianceStatus(traceId, 1)).rejects.toThrow();

      expect(mockTraceAdapter.validateTrace).not.toHaveBeenCalled();
    });

    it('should update compliance status if TRACES status changed', async () => {
      const oldRecord = { ...mockEudrRecord, compliance_status: 'pending' };
      mockEudrRepository.findOne.mockResolvedValue(oldRecord);
      mockTraceAdapter.validateTrace.mockResolvedValue(mockTracesStatus);
      mockEudrRepository.save.mockResolvedValue(mockEudrRecord);

      await service.getTraceComplianceStatus(traceId, 1);

      expect(mockEudrRepository.save).toHaveBeenCalled();
      const savedRecord = mockEudrRepository.save.mock.calls[0][0];
      expect(savedRecord.compliance_status).toBe('verified');
    });

    it('should persist TRACES metadata when records are synced', async () => {
      const oldRecord = { ...mockEudrRecord, compliance_status: 'verified', eori_number: 'ES0000000000AA', operator_name: 'Old Name', is_valid: false, risk_level: 'medium' };
      const updatedStatus: TraceValidationResponse = {
        traceId,
        isValid: true,
        eoriNumber: 'ES1234567890AB',
        operatorName: 'Agro Operator S.L.',
        complianceStatus: 'verified',
        riskLevel: 'low',
        registeredDate: '2026-06-23T00:00:00Z',
        lastUpdated: '2026-06-23T12:00:00Z',
        issues: ['All good'],
      };

      mockEudrRepository.findOne.mockResolvedValue(oldRecord);
      mockTraceAdapter.validateTrace.mockResolvedValue(updatedStatus);
      mockEudrRepository.save.mockResolvedValue({ ...oldRecord, ...updatedStatus });

      const result = await service.getTraceComplianceStatus(traceId, 1);

      expect(mockEudrRepository.save).toHaveBeenCalled();
      const savedRecord = mockEudrRepository.save.mock.calls[0][0];
      expect(savedRecord.eori_number).toBe('ES1234567890AB');
      expect(savedRecord.operator_name).toBe('Agro Operator S.L.');
      expect(savedRecord.is_valid).toBe(true);
      expect(savedRecord.risk_level).toBe('low');
      expect(savedRecord.trace_registered_date).toEqual(new Date('2026-06-23T00:00:00Z'));
      expect(savedRecord.trace_last_updated).toEqual(new Date('2026-06-23T12:00:00Z'));
      expect(savedRecord.issues).toBe('All good');
      expect(result.tracesStatus).toEqual(updatedStatus);
    });
  });

  describe('EORI Number Validation', () => {
    it('should validate correct EORI format', () => {
      mockTraceAdapter.validateEoriNumber.mockReturnValue(true);
      const isValid = service.isValidEoriNumber('ES1234567890AB');
      expect(isValid).toBe(true);
    });

    it('should reject invalid EORI format', () => {
      mockTraceAdapter.validateEoriNumber.mockReturnValue(false);
      const isValid = service.isValidEoriNumber('INVALID');
      expect(isValid).toBe(false);
    });
  });

  describe('Sync with TRACES', () => {
    it('should sync EUDR record with current TRACES status', async () => {
      const eudrId = 1;
      const record: EudrRegistry = {
        id: eudrId,
        trace_id: '550e8400-e29b-41d4-a716-446655440000',
        registry_number: 'EUDR-2026-001',
        compliance_status: 'pending',
        issues: '',
        plot_id: 10,
        tenant_id: 1,
        source: 'TRACES',
        trace_url: '',
        created_at: new Date(),
        updated_at: new Date(),
        plot: undefined as any,
      };

      mockEudrRepository.findOne.mockResolvedValue(record);
      const newStatus: TraceValidationResponse = {
        traceId: record.trace_id,
        isValid: true,
        complianceStatus: 'verified',
        riskLevel: 'low',
        issues: [],
      };
      mockTraceAdapter.validateTrace.mockResolvedValue(newStatus);
      mockEudrRepository.save.mockResolvedValue({ ...record, compliance_status: 'verified' });

      const result = await service.syncWithTraces(eudrId);

      expect(mockEudrRepository.findOne).toHaveBeenCalledWith({ where: { id: eudrId } });
      expect(mockTraceAdapter.validateTrace).toHaveBeenCalledWith(record.trace_id);
      expect(mockEudrRepository.save).toHaveBeenCalled();
      expect(result.compliance_status).toBe('verified');
    });

    it('should throw error if EUDR record not found', async () => {
      mockEudrRepository.findOne.mockResolvedValue(null);

      await expect(service.syncWithTraces(999)).rejects.toThrow();

      expect(mockTraceAdapter.validateTrace).not.toHaveBeenCalled();
    });
  });
});
