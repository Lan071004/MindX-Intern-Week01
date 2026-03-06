import { IAnalyticsPort } from "@/ports/IAnalyticsPort";
import { IAuthPort } from "@/ports/IAuthPort";

export class SignUpUseCase {
    constructor(
        private readonly authPort: IAuthPort,
        private readonly analyticsPort: IAnalyticsPort
    ) {}

    async execute(email: string, password: string) {
        this.analyticsPort.trackEvent('Authentication', 'SignUp Attempt', email);

        try {
            const user = await this.authPort.signUp(email, password);
            this.analyticsPort.trackEvent('Authentication', 'SignUp Success', email);
            return user;
        } catch (error) {
            this.analyticsPort.trackEvent('Authentication', 'SignUp Failed', email);
            throw error;
        }
    }
}