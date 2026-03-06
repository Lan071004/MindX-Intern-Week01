import { LoginUseCase } from './LoginUseCase';
import { IAuthPort } from '../../ports/IAuthPort';
import { IAnalyticsPort } from '../../ports/IAnalyticsPort';
import { AuthError, AuthErrorCode } from '../../domain/errors/AuthError';

const mockAuthPort: jest.Mocked<IAuthPort> = {
  login: jest.fn(),
  signUp: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  getCurrentUser: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

const mockAnalyticsPort: jest.Mocked<IAnalyticsPort> = {
  init: jest.fn(),
  trackPageView: jest.fn(),
  trackEvent: jest.fn(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockAuthPort, mockAnalyticsPort);
  });

  describe('execute — success', () => {
    it('should return User on successful login', async () => {
      const mockUser = { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' };
      mockAuthPort.login.mockResolvedValue(mockUser);

      const result = await useCase.execute('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
    });

    it('should call authPort.login with correct credentials', async () => {
      mockAuthPort.login.mockResolvedValue({ uid: 'user-123', email: 'test@example.com', displayName: 'Test User' });

      await useCase.execute('test@example.com', 'password123');

      expect(mockAuthPort.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should track LoginAttempt before calling authPort', async () => {
      mockAuthPort.login.mockResolvedValue({ uid: 'user-123', email: 'test@example.com', displayName: 'Test User' });

      await useCase.execute('test@example.com', 'password123');

      // trackEvent('LoginAttempt') phải được gọi trước login()
      const trackCalls = mockAnalyticsPort.trackEvent.mock.invocationCallOrder;
      const loginCall = mockAuthPort.login.mock.invocationCallOrder[0];
      expect(trackCalls[0]).toBeLessThan(loginCall);
    });

    it('should track Login Success after successful login', async () => {
      mockAuthPort.login.mockResolvedValue({ uid: 'user-123', email: 'test@example.com', displayName: 'Test User' });

      await useCase.execute('test@example.com', 'password123');

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledWith(
        'Authentication', 'Login Success', 'test@example.com'
      );
    });

    it('should track exactly 2 events on success (Attempt + Success)', async () => {
      mockAuthPort.login.mockResolvedValue({ uid: 'user-123', email: 'test@example.com', displayName: 'Test User' });

      await useCase.execute('test@example.com', 'password123');

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('execute — failure', () => {
    it('should track Login Failed when authPort throws', async () => {
      mockAuthPort.login.mockRejectedValue(
        new AuthError(AuthErrorCode.INVALID_CREDENTIAL, 'Email hoặc mật khẩu không đúng.')
      );

      await expect(useCase.execute('test@example.com', 'wrong-password')).rejects.toThrow();

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledWith(
        'Authentication', 'Login Failed', 'test@example.com'
      );
    });

    it('should rethrow the original error', async () => {
      const originalError = new AuthError(AuthErrorCode.INVALID_CREDENTIAL, 'Email hoặc mật khẩu không đúng.');
      mockAuthPort.login.mockRejectedValue(originalError);

      await expect(useCase.execute('test@example.com', 'wrong')).rejects.toBe(originalError);
    });

    it('should track exactly 2 events on failure (Attempt + Failed)', async () => {
      mockAuthPort.login.mockRejectedValue(new Error('error'));

      await expect(useCase.execute('test@example.com', 'password')).rejects.toThrow();

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledTimes(2);
    });
  });
});