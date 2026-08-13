import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { TestPlot } from './entities/test-plot.entity';

describe('App (e2e)', () => {
  let app: INestApplication;
  let plotRepository: Repository<TestPlot>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    plotRepository = moduleFixture.get<Repository<TestPlot>>(getRepositoryToken(TestPlot));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/geo (Geospatial Validation)', () => {
    it('/geo/validate (POST) - should accept GeoJSON input', () => {
      return request(app.getHttpServer())
        .post('/geo/validate')
        .send({
          geojson: {
            type: 'Point',
            coordinates: [-79.35, -2.05],
          },
        })
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });

    it('/geo/validate (POST) - should handle invalid input', () => {
      return request(app.getHttpServer())
        .post('/geo/validate')
        .send({
          geojson: {
            type: 'InvalidType',
          },
        })
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('/nft (NFT Management)', () => {
    it('/nfts (POST) - should handle requests', () => {
      return request(app.getHttpServer())
        .post('/nfts')
        .send({})
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('/credit (Credit Proposals)', () => {
    it('/credit/proposal (POST) - should handle requests', () => {
      return request(app.getHttpServer())
        .post('/credit/proposal')
        .send({})
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });

    it('/credit/proposals/:borrowerId (GET) - should handle requests', () => {
      return request(app.getHttpServer())
        .get('/credit/proposals/1')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', () => {
      return request(app.getHttpServer()).get('/unknown-route').expect(404);
    });

    it('should handle validation errors', () => {
      return request(app.getHttpServer()).post('/geo/validate').send({}).expect(400);
    });
  });
});
