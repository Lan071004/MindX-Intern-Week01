import express from 'express';
import request from 'supertest';
import { createProtectedRouter } from './protectedRoutes';
import { IAuthService } from '../../../../ports/inbound/IAuthService';
import { AuthError, AuthErrorCode } from '../../../../domain/errors/AuthError';

const mockAuthService: jest.Mocked<IAuthService> = {
  verifyToken: jest.fn(),
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/protected', createProtectedRouter(mockAuthService));
  return app;
};

describe('GET /protected/profile', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('Missing / invalid Authorization header', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/protected/profile');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Missing or invalid authorization header');
    });

    it('should return 401 when Authorization header is not Bearer', async () => {
      const res = await request(app)
        .get('/protected/profile')
        .set('Authorization', 'Token abc123');

      expect(res.status).toBe(401);
    });
  });

  describe('Valid token', () => {
    it('should return 200 with user info and timestamp', async () => {
      mockAuthService.verifyToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      });

      const res = await request(app)
        .get('/protected/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('This is protected data');
      expect(res.body.user).toEqual({ uid: 'user-123', email: 'test@example.com' });
      expect(res.body.timestamp).toBeDefined();
    });

    it('should return a valid ISO timestamp', async () => {
      mockAuthService.verifyToken.mockResolvedValue({ uid: 'user-123' });

      const res = await request(app)
        .get('/protected/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(() => new Date(res.body.timestamp)).not.toThrow();
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });
  });

  describe('Invalid token', () => {
    it('should return 401 when token is invalid', async () => {
      mockAuthService.verifyToken.mockRejectedValue(
        new AuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid token')
      );

      const res = await request(app)
        .get('/protected/profile')
        .set('Authorization', 'Bearer bad-token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });
  });
});