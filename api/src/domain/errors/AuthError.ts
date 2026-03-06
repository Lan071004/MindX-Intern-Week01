export enum AuthErrorCode {
    MISSING_TOKEN = 'MISSING_TOKEN',
    INVALID_TOKEN = 'INVALID_TOKEN',
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    UNAUTHORIZED = 'UNAUTHORIZED',
}

export class AuthError extends Error { 
    constructor(
        public readonly code: AuthErrorCode,
        message: string
    ) {
        super(message);
        this.name = 'AuthError';    
    }
}

