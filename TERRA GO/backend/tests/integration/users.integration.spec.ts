import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from '../../test/test-app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and login to get token for authenticated requests
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        nombre: 'Admin User',
        rol: 'productor',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return all users with authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('nombre');
          expect(res.body[0]).toHaveProperty('rol');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a specific user', async () => {
      // First get all users to find an ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

      const userId = usersResponse.body[0].id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('nombre');
          expect(res.body).toHaveProperty('rol');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/users/1')
        .expect(401);
    });
  });
});