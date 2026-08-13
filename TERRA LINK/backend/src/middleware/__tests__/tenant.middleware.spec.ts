import { TenantMiddleware } from '../tenant.middleware';

describe('TenantMiddleware', () => {
  it('attaches tenantId from header', () => {
    const mw = new TenantMiddleware();
    const req: any = { headers: { 'x-tenant-id': '42' }, hostname: 'localhost' };
    const res: any = {};
    let called = false;
    mw.use(req, res, () => { called = true; });
    expect(called).toBe(true);
    expect(req.tenantId).toBe(42);
  });

  it('does not attach tenantId when missing', () => {
    const mw = new TenantMiddleware();
    const req: any = { headers: {}, hostname: 'localhost' };
    const res: any = {};
    mw.use(req, res, () => {});
    expect(req.tenantId).toBeUndefined();
  });
});
