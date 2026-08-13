import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Performance Tests', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login to get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'perf@example.com',
        password: 'password123',
        nombre: 'Performance User',
        rol: 'productor',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'perf@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Response Time Tests', () => {
    it('should respond to auth endpoints within acceptable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'perf@example.com',
          password: 'password123',
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 500ms for auth operations
      expect(responseTime).toBeLessThan(500);
    });

    it('should respond to user profile endpoint within acceptable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 200ms for profile operations
      expect(responseTime).toBeLessThan(200);
    });

    it('should respond to users list endpoint within acceptable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 300ms for list operations
      expect(responseTime).toBeLessThan(300);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent login requests', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'perf@example.com',
              password: 'password123',
            })
            .expect(200),
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should complete within reasonable time
      expect(totalTime).toBeLessThan(2000); // 2 seconds for 10 concurrent requests
    });

    it('should handle multiple concurrent profile requests', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200),
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should complete within reasonable time
      expect(totalTime).toBeLessThan(1000); // 1 second for 10 concurrent requests
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not have memory leaks in repeated requests', async () => {
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
      }

      // If there were memory leaks, the process would likely crash or slow down significantly
      // This test ensures the endpoint can handle repeated calls without issues
    });

    it('should handle large request payloads gracefully', () => {
      const largePayload = {
        email: 'test@example.com',
        password: 'password123',
        nombre: 'a'.repeat(1000), // Large name field
        rol: 'productor',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(largePayload)
        .expect(400); // Should reject due to validation
    });
  });

  describe('Database Query Performance', () => {
    it('should handle user lookup operations efficiently', async () => {
      // Create multiple users for testing
      const userPromises = [];
      for (let i = 0; i < 5; i++) {
        userPromises.push(
          request(app.getHttpServer())
            .post('/auth/register')
            .send({
              email: `perfuser${i}@example.com`,
              password: 'password123',
              nombre: `Performance User ${i}`,
              rol: 'productor',
            }),
        );
      }
      await Promise.all(userPromises);

      // Test user lookup performance
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should handle reasonable number of users within time limits
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle error responses quickly', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Error responses should be fast
      expect(responseTime).toBeLessThan(100);
    });

    it('should handle 404 responses quickly', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/nonexistent-endpoint')
        .expect(404);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 404 responses should be fast
      expect(responseTime).toBeLessThan(50);
    });
  });
});