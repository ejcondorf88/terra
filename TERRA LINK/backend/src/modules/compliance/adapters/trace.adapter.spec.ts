import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TraceAdapter, TraceValidationResponse } from './trace.adapter';

// Mock fetch globally
global.fetch = jest.fn();

describe('TraceAdapter - TRACES API Client', () => {
  let adapter: TraceAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraceAdapter],
    }).compile();

    adapter = module.get<TraceAdapter>(TraceAdapter);
    jest.clearAllMocks();
  });

  describe('validateTrace', () => {
    const traceId = '550e8400-e29b-41d4-a716-446655440000';

    const mockValidResponse: TraceValidationResponse = {
      traceId,
      isValid: true,
      eoriNumber: 'ES1234567890AB',
      operatorName: 'Agro Operator S.L.',
      complianceStatus: 'verified',
      registeredDate: '2026-06-23T00:00:00Z',
      lastUpdated: '2026-06-23T12:00:00Z',
      riskLevel: 'low',
      issues: [],
    };

    it('should validate a trace successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidResponse,
      });

      const result = await adapter.validateTrace(traceId);

      expect(result).toEqual(mockValidResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(traceId),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/Bearer /),
          }),
        }),
      );
    });

    it('should throw NotFoundException for non-existent trace', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(adapter.validateTrace(traceId)).rejects.toThrow(HttpException);
    });

    it('should handle network errors gracefully', async () => {
      const error = new Error('ECONNREFUSED');
      (error as any).code = 'ECONNREFUSED';
      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      const result = await adapter.validateTrace(traceId);

      expect(result.complianceStatus).toBe('unknown');
    });

    it('should handle various compliance statuses', async () => {
      const statuses = ['verified', 'pending', 'rejected', 'unknown'] as const;

      for (const status of statuses) {
        const response = { ...mockValidResponse, complianceStatus: status };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });

        const result = await adapter.validateTrace(traceId);
        expect(result.complianceStatus).toBe(status);
      }
    });
  });

  describe('registerTrace', () => {
    const registerRequest = {
      traceId: '550e8400-e29b-41d4-a716-446655440000',
      eoriNumber: 'ES1234567890AB',
      operatorName: 'Agro Operator S.L.',
      deforestationStatus: 'compliant' as const,
      certifications: ['GlobalGAP', 'Organic'],
    };

    const mockRegistrationResponse = {
      traceId: registerRequest.traceId,
      registryNumber: 'EUDR-CERT-2026-001',
      complianceStatus: 'verified',
      timestamp: '2026-06-23T12:00:00Z',
      confirmationUrl: 'https://traces.ec.europa.eu/cert/EUDR-CERT-2026-001',
    };

    it('should register a trace successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistrationResponse,
      });

      const result = await adapter.registerTrace(registerRequest);

      expect(result).toEqual(mockRegistrationResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('register'),
        expect.any(Object),
      );
    });

    it('should throw error on registration failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(adapter.registerTrace(registerRequest)).rejects.toThrow(HttpException);
    });

    it('should include proper headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistrationResponse,
      });

      await adapter.registerTrace(registerRequest);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers.Authorization).toMatch(/Bearer /);
      expect(callArgs.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('getTraceHistory', () => {
    const traceId = '550e8400-e29b-41d4-a716-446655440000';

    it('should retrieve trace history', async () => {
      const mockHistory = [
        {
          timestamp: '2026-06-23T10:00:00Z',
          status: 'registered',
          details: 'Initial registration',
        },
        {
          timestamp: '2026-06-23T12:00:00Z',
          status: 'verified',
          details: 'Compliance verified',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

      const result = await adapter.getTraceHistory(traceId);

      expect(result).toEqual(mockHistory);
    });

    it('should return empty array if history unavailable', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await adapter.getTraceHistory(traceId);

      expect(result).toEqual([]);
    });
  });

  describe('validateEoriNumber', () => {
    it('should validate correct EORI format', () => {
      const validEori = 'ES1234567890AB';
      expect(adapter.validateEoriNumber(validEori)).toBe(true);
    });

    it('should validate EORI from different EU countries', () => {
      const validEoris = [
        'FR1234567890AB',
        'DE1234567890AB',
        'IT1234567890AB',
        'PT1234567890AB',
      ];

      validEoris.forEach((eori) => {
        expect(adapter.validateEoriNumber(eori)).toBe(true);
      });
    });

    it('should reject invalid EORI format', () => {
      const invalidEoris = [
        'es1234567890ab', // Wrong case
        'ES12345678901', // Wrong length (13 chars instead of 14)
        'ES-234567890AB', // Invalid characters (hyphen)
        'ES123', // Too short
      ];

      invalidEoris.forEach((eori) => {
        expect(adapter.validateEoriNumber(eori)).toBe(false);
      });
    });
  });

  describe('validateTraceIdFormat', () => {
    it('should validate UUID v4 format', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(adapter.validateTraceIdFormat(validUuid)).toBe(true);
    });

    it('should validate custom TRACE format', () => {
      const validTrace = 'TRACE-2026-000042';
      expect(adapter.validateTraceIdFormat(validTrace)).toBe(true);
    });

    it('should reject invalid format', () => {
      const invalidTraces = [
        'INVALID-FORMAT',
        '550e8400-e29b-41d4-a716',
        'trace-2026-000042',
        '2026-000042',
      ];

      invalidTraces.forEach((trace) => {
        expect(adapter.validateTraceIdFormat(trace)).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          traceId: '550e8400-e29b-41d4-a716-446655440000',
          isValid: true,
          complianceStatus: 'verified',
        }),
      });

      const result = await adapter.validateTrace('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toHaveProperty('traceId');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      (timeoutError as any).code = 'ETIMEDOUT';
      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      const result = await adapter.validateTrace('550e8400-e29b-41d4-a716-446655440000');

      expect(result.complianceStatus).toBe('unknown');
    });
  });

  describe('Security', () => {
    it('should include authorization header with API key', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          traceId: '550e8400-e29b-41d4-a716-446655440000',
          isValid: true,
          complianceStatus: 'verified',
        }),
      });

      await adapter.validateTrace('550e8400-e29b-41d4-a716-446655440000');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers.Authorization).toMatch(/Bearer /);
    });

    it('should set proper Content-Type header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await adapter.registerTrace({
        traceId: '550e8400-e29b-41d4-a716-446655440000',
        eoriNumber: 'ES1234567890AB',
        operatorName: 'Test',
        deforestationStatus: 'compliant',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers['Content-Type']).toBe('application/json');
    });
  });
});
