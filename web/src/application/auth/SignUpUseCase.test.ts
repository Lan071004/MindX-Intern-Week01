import { SignUpUseCase } from './SignUpUseCase';
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

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SignUpUseCase(mockAuthPort, mockAnalyticsPort);
  });

  describe('execute — success', () => {
    it('should return User on successful sign up', async () => {
      const mockUser = { uid: 'new-user-123', email: 'new@example.com', displayName: 'New User' };
      mockAuthPort.signUp.mockResolvedValue(mockUser);

      const result = await useCase.execute('new@example.com', 'password123');

      expect(result).toEqual(mockUser);
    });

    it('should call authPort.signUp with correct credentials', async () => {
      mockAuthPort.signUp.mockResolvedValue({ uid: 'new-user-123', email: 'new@example.com', displayName: 'New User' });

      await useCase.execute('new@example.com', 'password123');

      expect(mockAuthPort.signUp).toHaveBeenCalledWith('new@example.com', 'password123');
    });

    it('should track SignUp Attempt before calling authPort', async () => {
      mockAuthPort.signUp.mockResolvedValue({ uid: 'new-user-123', email: 'new@example.com', displayName: 'New User' });

      await useCase.execute('new@example.com', 'password123');

      const trackCalls = mockAnalyticsPort.trackEvent.mock.invocationCallOrder;
      const signUpCall = mockAuthPort.signUp.mock.invocationCallOrder[0];
      expect(trackCalls[0]).toBeLessThan(signUpCall);
    });

    it('should track SignUp Success after successful sign up', async () => {
      mockAuthPort.signUp.mockResolvedValue({ uid: 'new-user-123', email: 'new@example.com', displayName: 'New User' });

      await useCase.execute('new@example.com', 'password123');

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledWith(
        'Authentication', 'SignUp Success', 'new@example.com'
      );
    });

    it('should track exactly 2 events on success (Attempt + Success)', async () => {
      mockAuthPort.signUp.mockResolvedValue({ uid: 'new-user-123', email: 'new@example.com', displayName: 'New User' });

      await useCase.execute('new@example.com', 'password123');

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('execute — failure', () => {
    it('should track SignUp Failed when authPort throws', async () => {
      mockAuthPort.signUp.mockRejectedValue(
        new AuthError(AuthErrorCode.EMAIL_ALREADY_IN_USE, 'Email đã được sử dụng.')
      );

      await expect(useCase.execute('existing@example.com', 'password123')).rejects.toThrow();

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledWith(
        'Authentication', 'SignUp Failed', 'existing@example.com'
      );
    });

    it('should rethrow the original error', async () => {
      const originalError = new AuthError(AuthErrorCode.EMAIL_ALREADY_IN_USE, 'Email đã được sử dụng.');
      mockAuthPort.signUp.mockRejectedValue(originalError);

      await expect(useCase.execute('existing@example.com', 'password')).rejects.toBe(originalError);
    });

    it('should track exactly 2 events on failure (Attempt + Failed)', async () => {
      mockAuthPort.signUp.mockRejectedValue(new Error('error'));

      await expect(useCase.execute('test@example.com', 'password')).rejects.toThrow();

      expect(mockAnalyticsPort.trackEvent).toHaveBeenCalledTimes(2);
    });
  });
});