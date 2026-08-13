import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { TestPlot } from './entities/test-plot.entity';

describe('IoT Alerts (e2e)', () => {
  let app: INestApplication;
  let plotRepository: Repository<TestPlot>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Test middleware to simulate authenticated user (tests use jest auth mocks)
    app.use((req: any, _res, next) => {
      const t = req.headers['x-test-tenant'];
      const r = req.headers['x-test-role'];
      if (t) req.user = { tenantId: Number(t), role: r || 'productor' };
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    plotRepository = moduleFixture.get<Repository<TestPlot>>(getRepositoryToken(TestPlot));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates automatic alert for low humidity and lists it', async () => {
    const plot = await plotRepository.save({
      name: 'Alert E2E Plot',
      owner_id: 10,
      certification: 'GAP',
      geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
      valuation: 500,
      nft_token: null,
    });

    const readingResponse = await request(app.getHttpServer())
      .post('/iot/readings')
      .set('x-test-tenant', '8')
      .send({ plotId: plot.id, tenantId: 8, humidity: 25, temperature: 22 });

    expect(readingResponse.status).toBe(201);

    const alertsResponse = await request(app.getHttpServer())
      .get(`/iot/alerts?plotId=${plot.id}`)
      .set('x-test-tenant', '8');

    expect(alertsResponse.status).toBe(200);
    expect(Array.isArray(alertsResponse.body)).toBe(true);
    expect(alertsResponse.body.length).toBeGreaterThanOrEqual(1);
    expect(alertsResponse.body[0]).toMatchObject({ type: 'humidity', resolved: false });
  });

  it('resolves an alert and removes it from unresolved list', async () => {
    const plot = await plotRepository.save({
      name: 'Resolve Plot',
      owner_id: 11,
      certification: 'GAP',
      geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
      valuation: 800,
      nft_token: null,
    });

    const readingResponse = await request(app.getHttpServer())
      .post('/iot/readings')
      .set('x-test-tenant', '9')
      .send({ plotId: plot.id, tenantId: 9, humidity: 20, temperature: 20 });

    expect(readingResponse.status).toBe(201);

    const alertsResponse = await request(app.getHttpServer())
      .get(`/iot/alerts?plotId=${plot.id}`)
      .set('x-test-tenant', '9');

    const alertId = alertsResponse.body[0].id;

    const resolveResponse = await request(app.getHttpServer())
      .patch(`/iot/alerts/${alertId}/resolve`)
      .set('x-test-tenant', '9');

    expect(resolveResponse.status).toBe(200);
    expect(resolveResponse.body).toMatchObject({ id: alertId, resolved: true });

    const unresolvedResponse = await request(app.getHttpServer())
      .get(`/iot/alerts?plotId=${plot.id}`)
      .set('x-test-tenant', '9');

    expect(unresolvedResponse.status).toBe(200);
    expect(unresolvedResponse.body.find((a: any) => a.id === alertId)).toBeUndefined();
  });

  it('returns 403 when accessing alert from another tenant', async () => {
    const plot = await plotRepository.save({
      name: 'Other Tenant Plot',
      owner_id: 12,
      certification: 'GAP',
      geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
      valuation: 900,
      nft_token: null,
    });

    const readingResponse = await request(app.getHttpServer())
      .post('/iot/readings')
      .set('x-test-tenant', '20')
      .send({ plotId: plot.id, tenantId: 20, humidity: 20 });

    expect(readingResponse.status).toBe(201);

    const alertsResponse = await request(app.getHttpServer())
      .get(`/iot/alerts?plotId=${plot.id}`)
      .set('x-test-tenant', '20');

    expect(alertsResponse.status).toBe(200);
    const alertId = alertsResponse.body[0].id;

    // Attempt to fetch as a different tenant
    const forbidden = await request(app.getHttpServer())
      .get(`/iot/alerts/${alertId}`)
      .set('x-test-tenant', '999');

    expect(forbidden.status).toBe(403);
  });

  it('returns 404 for non-existent alert', async () => {
    const res = await request(app.getHttpServer())
      .get('/iot/alerts/999999')
      .set('x-test-tenant', '1');

    expect(res.status).toBe(404);
  });
});
