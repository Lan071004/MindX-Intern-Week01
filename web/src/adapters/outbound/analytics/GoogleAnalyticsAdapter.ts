import ReactGA from 'react-ga4';
import { IAnalyticsPort } from "@/ports/IAnalyticsPort";

export class GoogleAnalyticsAdapter implements IAnalyticsPort {
    init(): void {
        const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
        if (!measurementId) {
            ReactGA.initialize(measurementId, {
                gaOptions: {
                    debug_mode: import.meta.env.MODE === 'development',
                    
                },
            });
            console.log('Google Analytics initialized');
        } else {
            console.warn('GA Measurement ID not found');
        }
    }

    trackPageView(path: string): void {
        ReactGA.send({ hitType: 'pageview', page: path });
    }

    trackEvent(category: string, action: string, label?: string): void {
        ReactGA.event({ category, action, label });
    }
}