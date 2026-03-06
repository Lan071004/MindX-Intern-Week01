import { VerifyTokenUseCase } from './VerifyTokenUseCase';
import { ITokenVerifier } from '../../ports/outbound/ITokenVerifier';
import { AuthError, AuthErrorCode } from '../../domain/errors/AuthError';

// Mock ITokenVerifier — không cần Firebase thật
const mockTokenVerifier: jest.Mocked<ITokenVerifier> = {
  verifyToken: jest.fn(),
};

describe('VerifyTokenUseCase', () => {
  let useCase: VerifyTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new VerifyTokenUseCase(mockTokenVerifier);
  });

  describe('verifyToken — success', () => {
    it('should return User when token is valid', async () => {
      mockTokenVerifier.verifyToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });

      const result = await useCase.verifyToken('valid-token');

      expect(result).toEqual({
        uid: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should call tokenVerifier.verifyToken with correct token', async () => {
      mockTokenVerifier.verifyToken.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      });

      await useCase.verifyToken('my-token');

      expect(mockTokenVerifier.verifyToken).toHaveBeenCalledWith('my-token');
      expect(mockTokenVerifier.verifyToken).toHaveBeenCalledTimes(1);
    });

    it('should return User with undefined fields when tokenVerifier omits them', async () => {
      mockTokenVerifier.verifyToken.mockResolvedValue({
        uid: 'user-456',
      });

      const result = await useCase.verifyToken('valid-token');

      expect(result.uid).toBe('user-456');
      expect(result.email).toBeUndefined();
      expect(result.name).toBeUndefined();
    });
  });

  describe('verifyToken — failure', () => {
    it('should throw AuthError with INVALID_TOKEN when tokenVerifier throws', async () => {
      mockTokenVerifier.verifyToken.mockRejectedValue(new Error('Firebase error'));

      await expect(useCase.verifyToken('bad-token')).rejects.toThrow(AuthError);
      await expect(useCase.verifyToken('bad-token')).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_TOKEN,
        message: 'Invalid token',
      });
    });

    it('should always throw AuthError regardless of what tokenVerifier throws', async () => {
      mockTokenVerifier.verifyToken.mockRejectedValue(new TypeError('Unexpected error'));

      await expect(useCase.verifyToken('token')).rejects.toBeInstanceOf(AuthError);
    });
  });
});