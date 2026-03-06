export class AuthError extends Error {
    constructor (
        public readonly code: AuthErrorCode,
        message: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export enum AuthErrorCode {
    EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
    INVALID_EMAIL = 'INVALID_EMAIL',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    WRONG_PASSWORD = 'WRONG_PASSWORD',
    INVALID_CREDENTIAL = 'INVALID_CREDENTIAL',
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
    UNKNOWN = 'UNKNOWN',
}


export function mapFirebaseError(code: string): AuthError {
    const errorMap: Record<string, AuthErrorCode> = {
        'auth/email-already-in-use': AuthErrorCode.EMAIL_ALREADY_IN_USE,
        'auth/invalid-email': AuthErrorCode.INVALID_EMAIL,
        'auth/weak-password': AuthErrorCode.WEAK_PASSWORD,
        'auth/user-not-found': AuthErrorCode.USER_NOT_FOUND,
        'auth/wrong-password': AuthErrorCode.WRONG_PASSWORD,
        'auth/invalid-credential': AuthErrorCode.INVALID_CREDENTIAL,
        'auth/too-many-requests': AuthErrorCode.TOO_MANY_REQUESTS,
    };

    const errorCode = errorMap[code] ?? AuthErrorCode.UNKNOWN;

    const messageMap: Record<AuthErrorCode, string> = {
        [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'Email đã được sử dụng. Thử email khác hoặc đăng nhập.',
        [AuthErrorCode.INVALID_EMAIL]: 'Email không hợp lệ.',
        [AuthErrorCode.WEAK_PASSWORD]: 'Mật khẩu quá yếu. Cần ít nhất 6 ký tự.',
        [AuthErrorCode.USER_NOT_FOUND]: 'Không tìm thấy tài khoản với email này.',
        [AuthErrorCode.WRONG_PASSWORD]: 'Mật khẩu không đúng.',
        [AuthErrorCode.INVALID_CREDENTIAL]: 'Email hoặc mật khẩu không đúng.',
        [AuthErrorCode.TOO_MANY_REQUESTS]: 'Quá nhiều lần thử. Vui lòng thử lại sau.',
        [AuthErrorCode.UNKNOWN]: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    };

    return new AuthError(errorCode, messageMap[errorCode]);
}