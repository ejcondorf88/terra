import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CertificationController } from './certification.controller';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard, RbacGuard } from '@terra/shared/auth';

describe('CertificationController (RBAC)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CertificationController],
      providers: [
        {
          provide: ComplianceService,
          useValue: { createCertification: jest.fn().mockResolvedValue({ id: 1 }) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => false })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('denies access to productor role', async () => {
    const res = await request(app.getHttpServer())
      .post('/certifications')
      .send({ type: 'EUDR', issuedBy: 'SGS' });

    expect(res.status).toBe(403);
  });
});
