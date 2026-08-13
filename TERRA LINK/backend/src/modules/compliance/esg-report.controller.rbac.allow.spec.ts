import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EsgReportController } from './esg-report.controller';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard, RbacGuard } from '@terra/shared/auth';

describe('EsgReportController (RBAC allow)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EsgReportController],
      providers: [
        {
          provide: ComplianceService,
          useValue: { generateEsgReport: jest.fn().mockResolvedValue({ id: 1 }) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('allows banco to generate ESG report', async () => {
    const res = await request(app.getHttpServer())
      .post('/esg-reports')
      .send({ plot_id: 1, category: 'water', score: 80 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
  });
});
