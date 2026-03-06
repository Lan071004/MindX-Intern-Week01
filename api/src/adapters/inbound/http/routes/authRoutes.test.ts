import express from 'express';
import request from 'supertest';
import { createAuthRouter } from './authRoutes';
import { IAuthService } from '../../../../ports/inbound/IAuthService';
import { AuthError, AuthErrorCode } from '../../../../domain/errors/AuthError';

// Mock IAuthService — không cần Firebase thật
const mockAuthService: jest.Mocked<IAuthService> = {
  verifyToken: jest.fn(),
};

// Tạo app test không có app.listen() — đúng chuẩn TDD
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', createAuthRouter(mockAuthService));
  return app;
};

describe('POST /auth/verify-token', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('Missing / invalid Authorization header', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).post('/auth/verify-token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Missing or invalid authorization header');
    });

    it('should return 401 when Authorization header is not Bearer', async () => {
      const res = await request(app)
        .post('/auth/verify-token')
        .set('Authorization', 'Basic dXNlcjpwYXNz');

      expect(res.status).toBe(401);
    });
  });

  describe('Valid token', () => {
    it('should return 200 with user info when token is valid', async () => {
      mockAuthService.verifyToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/auth/verify-token')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Token is valid',
        user: { uid: 'user-123', email: 'test@example.com' },
      });
    });

    it('should call authService.verifyToken with the extracted token', async () => {
      mockAuthService.verifyToken.mockResolvedValue({ uid: 'user-123' });

      await request(app)
        .post('/auth/verify-token')
        .set('Authorization', 'Bearer my-token-value');

      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('my-token-value');
    });
  });

  describe('Invalid token', () => {
    it('should return 401 when token is invalid', async () => {
      mockAuthService.verifyToken.mockRejectedValue(
        new AuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid token')
      );

      const res = await request(app)
        .post('/auth/verify-token')
        .set('Authorization', 'Bearer bad-token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });
  });
});