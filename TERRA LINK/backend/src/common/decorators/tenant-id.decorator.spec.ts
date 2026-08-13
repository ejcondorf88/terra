import { TenantId } from './tenant-id.decorator';

describe('TenantId Decorator', () => {
  it('should be defined', () => {
    expect(TenantId).toBeDefined();
    expect(typeof TenantId).toBe('function');
  });
});
