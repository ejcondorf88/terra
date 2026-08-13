import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Security Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('JWT Authentication Security', () => {
    it('should reject malformed JWT tokens', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer malformed.jwt.token')
        .expect(401);
    });

    it('should reject expired JWT tokens', () => {
      // Using a clearly expired token format
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid';

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject tokens with invalid signature', () => {
      // Valid JWT structure but invalid signature
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.invalid_signature';

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should reject requests without Authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject requests with malformed Authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);
    });
  });

  describe('Input Sanitization and Validation', () => {
    it('should reject SQL injection attempts in email field', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: "'; DROP TABLE users; --",
          password: 'password123',
          nombre: 'Test User',
          rol: 'productor',
        })
        .expect(400);
    });

    it('should reject XSS attempts in name field', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          nombre: '<script>alert("XSS")</script>',
          rol: 'productor',
        })
        .expect(400);
    });

    it('should reject overly long input fields', () => {
      const longString = 'a'.repeat(1000);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `${longString}@example.com`,
          password: 'password123',
          nombre: longString,
          rol: 'productor',
        })
        .expect(400);
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user.example.com',
        'user@.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email,
            password: 'password123',
            nombre: 'Test User',
            rol: 'productor',
          })
          .expect(400);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = ['123', 'abc', 'password', ''];

      weakPasswords.forEach((password) => {
        request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password,
            nombre: 'Test User',
            rol: 'productor',
          })
          .expect(400);
      });
    });

    it('should reject invalid role values', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          nombre: 'Test User',
          rol: 'invalid-role',
        })
        .expect(400);
    });
  });

  describe('Rate Limiting and Brute Force Protection', () => {
    it('should handle multiple failed login attempts gracefully', async () => {
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          })
          .expect(401);
      }

      // System should still respond (no rate limiting implemented yet, but test structure is ready)
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Data Exposure Prevention', () => {
    it('should not expose sensitive information in error messages', async () => {
      // Register a user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'security@example.com',
          password: 'password123',
          nombre: 'Security Test',
          rol: 'productor',
        });

      // Try to login with wrong password
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'security@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      // Error message should not reveal if email exists or password is wrong
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body.message).not.toContain('email');
      expect(response.body.message).not.toContain('password');
    });

    it('should not expose internal system information', () => {
      return request(app.getHttpServer())
        .get('/nonexistent-endpoint')
        .expect(404)
        .expect((res) => {
          // Should not expose framework information
          expect(res.body).not.toHaveProperty('stack');
          expect(res.body).not.toHaveProperty('trace');
        });
    });
  });
});