import { User } from "../../domain/entities/User";
import { AuthError, AuthErrorCode } from "../../domain/errors/AuthError";
import { IAuthService } from "../../ports/inbound/IAuthService";
import { ITokenVerifier } from "../../ports/outbound/ITokenVerifier";

export class VerifyTokenUseCase implements IAuthService {
  constructor(private readonly tokenVerifier: ITokenVerifier) {}

    async verifyToken(token: string): Promise<User> {
        try {
            const decoded = await this.tokenVerifier.verifyToken(token);
            return {
                uid: decoded.uid,
                email: decoded.email,
                name: decoded.name
            };
        } catch (error) {
            throw new AuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid token');
        }   
    }
}