import { IAnalyticsPort } from "@/ports/IAnalyticsPort";
import { IAuthPort } from "@/ports/IAuthPort";
import { User } from "@/domain/entities/User";

export class LoginUseCase {
    constructor(
        private readonly authPort: IAuthPort,
        private readonly analyticsPort: IAnalyticsPort
    ) {}

    async execute(email: string, password: string): Promise<User> {
        this.analyticsPort.trackEvent('Auth', 'LoginAttempt', email);

        try {
            const user = await this.authPort.login(email, password);
            this.analyticsPort.trackEvent('Authentication', 'Login Success', email);
            return user;
        } catch (error) {
            this.analyticsPort.trackEvent('Authentication', 'Login Failed', email);
            throw error;
        }
    }
}