import { AuthError, AuthErrorCode, mapFirebaseError } from './AuthError';

describe('AuthError', () => {
  it('should create error with correct code and message', () => {
    const error = new AuthError(AuthErrorCode.INVALID_CREDENTIAL, 'Invalid token');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIAL);
    expect(error.message).toBe('Invalid token');
    expect(error.name).toBe('AuthError');
  });
});

describe('mapFirebaseError', () => {
  const cases: Array<[string, AuthErrorCode, string]> = [
    ['auth/email-already-in-use', AuthErrorCode.EMAIL_ALREADY_IN_USE, 'Email đã được sử dụng. Thử email khác hoặc đăng nhập.'],
    ['auth/invalid-email',        AuthErrorCode.INVALID_EMAIL,        'Email không hợp lệ.'],
    ['auth/weak-password',        AuthErrorCode.WEAK_PASSWORD,        'Mật khẩu quá yếu. Cần ít nhất 6 ký tự.'],
    ['auth/user-not-found',       AuthErrorCode.USER_NOT_FOUND,       'Không tìm thấy tài khoản với email này.'],
    ['auth/wrong-password',       AuthErrorCode.WRONG_PASSWORD,       'Mật khẩu không đúng.'],
    ['auth/invalid-credential',   AuthErrorCode.INVALID_CREDENTIAL,   'Email hoặc mật khẩu không đúng.'],
    ['auth/too-many-requests',    AuthErrorCode.TOO_MANY_REQUESTS,    'Quá nhiều lần thử. Vui lòng thử lại sau.'],
  ];

  test.each(cases)(
    'should map "%s" → AuthErrorCode.%s',
    (firebaseCode, expectedCode, expectedMessage) => {
      const error = mapFirebaseError(firebaseCode);

      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(expectedCode);
      expect(error.message).toBe(expectedMessage);
    }
  );

  it('should map unknown firebase code → UNKNOWN', () => {
    const error = mapFirebaseError('auth/some-unknown-code');

    expect(error.code).toBe(AuthErrorCode.UNKNOWN);
    expect(error.message).toBe('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  });
});