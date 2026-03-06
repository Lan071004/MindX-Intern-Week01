export interface IAnalyticsPort {
    init(): void;
    trackPageView(path: string): void;
    trackEvent(category: string, action: string, label?: string): void;
}