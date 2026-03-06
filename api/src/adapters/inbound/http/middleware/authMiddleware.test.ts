import { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from './authMiddleware';
import { IAuthService } from '../../../../ports/inbound/IAuthService';
import { AuthError, AuthErrorCode } from '../../../../domain/errors/AuthError';

// Helper tạo mock Express objects
const mockRequest = (authHeader?: string): Partial<Request> => ({
  headers: { authorization: authHeader },
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

const mockAuthService: jest.Mocked<IAuthService> = {
  verifyToken: jest.fn(),
};

describe('authMiddleware', () => {
  let middleware: ReturnType<typeof createAuthMiddleware>;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = createAuthMiddleware(mockAuthService);
  });

  describe('Authorization header validation', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const req = mockRequest(undefined);
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing or invalid authorization header',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header does not start with Bearer', async () => {
      const req = mockRequest('Basic some-token');
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header is empty string', async () => {
      const req = mockRequest('');
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Token verification — success', () => {
    it('should call next() when token is valid', async () => {
      mockAuthService.verifyToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      });

      const req = mockRequest('Bearer valid-token');
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should attach userId and userEmail to request', async () => {
      mockAuthService.verifyToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      });

      const req = mockRequest('Bearer valid-token') as Request;
      const res = mockResponse();

      await middleware(req, res as Response, mockNext);

      expect(req.userId).toBe('user-123');
      expect(req.userEmail).toBe('test@example.com');
    });

    it('should extract token correctly from Bearer header', async () => {
      mockAuthService.verifyToken.mockResolvedValue({ uid: 'user-123' });

      const req = mockRequest('Bearer my-actual-token');
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('my-actual-token');
    });
  });

  describe('Token verification — failure', () => {
    it('should return 401 when authService throws AuthError', async () => {
      mockAuthService.verifyToken.mockRejectedValue(
        new AuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid token')
      );

      const req = mockRequest('Bearer bad-token');
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 when authService throws unexpected error', async () => {
      mockAuthService.verifyToken.mockRejectedValue(new Error('Unexpected error'));

      const req = mockRequest('Bearer some-token');
      const res = mockResponse();

      await middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});