import { User } from "../../domain/entities/User";

export interface IAuthService {
    verifyToken(token: string): Promise<User>;
}