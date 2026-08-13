import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { TestPlot } from './entities/test-plot.entity';

describe('ComplianceModule (e2e)', () => {
  let app: INestApplication;
  let plotRepository: Repository<TestPlot>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('POST /compliance/satellite-validation', () => {
    it('validates plot against satellite data', async () => {
      const plot = await plotRepository.save({
        name: 'Test Plot',
        owner_id: 1,
        certification: 'GAP',
        geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
        valuation: 1000,
        nft_token: null,
      });

      const response = await request(app.getHttpServer())
        .post('/compliance/satellite-validation')
        .send({
          plotId: plot.id,
          coordinates: {
            type: 'Polygon',
            coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
          },
          dateRange: { from: '2025-01-01', to: '2025-01-30' },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('validationResult');
      expect(response.body.validationResult).toMatchObject({
        plot_id: plot.id,
        ndvi: 0.85,
        recent_deforestation_detected: false,
        source: 'sentinel',
      });
      expect(response.body.validationResult).toHaveProperty('iotContext');
      expect(response.body.validationResult.iotContext).toHaveProperty('activeAlerts');
    });
  });

  describe('POST /compliance/certifications', () => {
    it('creates certification for admin role', async () => {
      const response = await request(app.getHttpServer())
        .post('/compliance/certifications')
        .send({ name: 'EUDR Cert', standard: 'EUDR', plot_id: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
    });
  });

  describe('POST /compliance/eudr', () => {
    it('registers EUDR entry for exportador role', async () => {
      const response = await request(app.getHttpServer())
        .post('/compliance/eudr')
        .send({ trace_id: 'T-1', registry_number: 'EUDR-1', plot_id: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('trace_id', 'T-1');
      expect(response.body).toHaveProperty('registry_number', 'EUDR-1');
    });
  });

  describe('POST /compliance/esg-reports', () => {
    it('generates ESG report for banco role', async () => {
      const response = await request(app.getHttpServer())
        .post('/compliance/esg-reports')
        .send({ plot_id: 1, category: 'water', score: 80 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
    });
  });

  describe('IoT endpoints', () => {
    it('stores sensor readings and exposes plot history', async () => {
      const plot = await plotRepository.save({
        name: 'IoT Plot',
        owner_id: 2,
        certification: 'GAP',
        geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
        valuation: 1200,
        nft_token: null,
      });

      const readingResponse = await request(app.getHttpServer())
        .post('/iot/readings')
        .send({ plotId: plot.id, tenantId: 7, humidity: 60, temperature: 24, ph: 6.5 });

      expect(readingResponse.status).toBe(201);
      expect(readingResponse.body).toHaveProperty('id');
      expect(readingResponse.body).toMatchObject({ plotId: plot.id, tenantId: 7, humidity: 60 });

      const droneResponse = await request(app.getHttpServer())
        .post('/iot/drones')
        .send({ plotId: plot.id, tenantId: 7, ndvi: 0.82, imageUrl: 'https://example.com/ndvi.png' });

      expect(droneResponse.status).toBe(201);
      expect(droneResponse.body).toMatchObject({ plotId: plot.id, ndvi: 0.82, source: 'drone' });

      const historyResponse = await request(app.getHttpServer()).get(`/iot/plots/${plot.id}`);
      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.readings.length).toBeGreaterThanOrEqual(2);
      expect(historyResponse.body).toHaveProperty('climate');
    });

    it('rejects invalid reading data and returns validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/iot/readings')
        .send({ plotId: 'not-a-number', humidity: 'high' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('rejects invalid reading data and returns validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/iot/readings')
        .send({ plotId: 'not-a-number', humidity: 'high' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('lists unresolved alerts and resolves a specific alert', async () => {
      const plot = await plotRepository.save({
        name: 'Alert Plot',
        owner_id: 3,
        certification: 'GAP',
        geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
        valuation: 2000,
        nft_token: null,
      });

      // Create a low-humidity reading that triggers an alert
      const readingResponse = await request(app.getHttpServer())
        .post('/iot/readings')
        .send({ plotId: plot.id, tenantId: 8, humidity: 25, temperature: 22 });

      expect(readingResponse.status).toBe(201);
      expect(readingResponse.body).toHaveProperty('id');

      const alertsResponse = await request(app.getHttpServer()).get(`/iot/alerts?plotId=${plot.id}`);
      expect(alertsResponse.status).toBe(200);
      expect(Array.isArray(alertsResponse.body)).toBe(true);
      expect(alertsResponse.body.length).toBeGreaterThanOrEqual(1);
      expect(alertsResponse.body[0]).toMatchObject({ type: 'humidity', resolved: false });

      const alertId = alertsResponse.body[0].id;
      const resolveResponse = await request(app.getHttpServer()).patch(`/iot/alerts/${alertId}/resolve`);
      expect(resolveResponse.status).toBe(200);
      expect(resolveResponse.body).toMatchObject({ id: alertId, resolved: true });

      const unresolvedResponse = await request(app.getHttpServer()).get(`/iot/alerts?plotId=${plot.id}`);
      expect(unresolvedResponse.status).toBe(200);
      expect(unresolvedResponse.body.find((item: any) => item.id === alertId)).toBeUndefined();
    });

    it('returns alerts dashboard metrics for the authenticated tenant', async () => {
      const plot = await plotRepository.save({
        name: 'Dashboard Plot',
        owner_id: 20,
        certification: 'GAP',
        geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
        valuation: 1300,
        nft_token: null,
      });

      const readingResponse = await request(app.getHttpServer())
        .post('/iot/readings')
        .set('x-test-tenant', '20')
        .send({ plotId: plot.id, tenantId: 20, humidity: 25, temperature: 22 });

      expect(readingResponse.status).toBe(201);

      const dashboardResponse = await request(app.getHttpServer())
        .get('/compliance/alerts-dashboard')
        .set('x-test-tenant', '20');

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body).toHaveProperty('totalUnresolved', 1);
      expect(dashboardResponse.body.bySeverity).toMatchObject({ high: 1, medium: 0, low: 0, critical: 0 });
      expect(dashboardResponse.body.byType).toMatchObject({ humidity: 1, ndvi: 0, ph: 0, pest: 0 });
      expect(dashboardResponse.body.recurringTypes).toEqual([]);
      expect(dashboardResponse.body.recentCount30d).toBe(1);
      expect(dashboardResponse.body.summaryText).toContain('IoT alerts: 1 unresolved');
    });

    it('creates, fetches and resolves a manual alert', async () => {
      const plot = await plotRepository.save({
        name: 'Manual Alert Plot',
        owner_id: 4,
        certification: 'GAP',
        geom: 'POLYGON((0 0,0 1,1 1,1 0,0 0))',
        valuation: 2200,
        nft_token: null,
      });

      const manualResponse = await request(app.getHttpServer())
        .post('/iot/alerts')
        .send({
          plotId: plot.id,
          tenantId: 9,
          type: 'ph',
          value: 5.2,
          threshold: 6,
          message: 'Soil acidity below threshold',
        });

      expect(manualResponse.status).toBe(201);
      expect(manualResponse.body).toMatchObject({
        plotId: plot.id,
        tenantId: 9,
        type: 'ph',
        value: 5.2,
        threshold: 6,
        message: 'Soil acidity below threshold',
        resolved: false,
      });

      const alertId = manualResponse.body.id;
      const getResponse = await request(app.getHttpServer()).get(`/iot/alerts/${alertId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toMatchObject({ id: alertId, plotId: plot.id, type: 'ph' });

      const resolveResponse = await request(app.getHttpServer()).patch(`/iot/alerts/${alertId}/resolve`);
      expect(resolveResponse.status).toBe(200);
      expect(resolveResponse.body).toMatchObject({ id: alertId, resolved: true });
    });

    it('returns 404 for missing alert id and resolve non-existent alert', async () => {
      const missing = await request(app.getHttpServer()).get('/iot/alerts/99999');
      expect(missing.status).toBe(404);

      const missingResolve = await request(app.getHttpServer()).patch('/iot/alerts/99999/resolve');
      expect(missingResolve.status).toBe(404);
    });
  });
});
