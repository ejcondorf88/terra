import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EudrRegistryController } from './eudr-registry.controller';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard, RbacGuard } from '@terra/shared/auth';

describe('EudrRegistryController (RBAC)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EudrRegistryController],
      providers: [
        {
          provide: ComplianceService,
          useValue: { registerEudr: jest.fn().mockResolvedValue({ id: 1 }) },
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

  it('denies access to productor role for registering EUDR', async () => {
    const res = await request(app.getHttpServer())
      .post('/eudr')
      .send({ trace_id: 'T-1', registry_number: 'EUDR-1', plot_id: 1 });

    expect(res.status).toBe(403);
  });
});
