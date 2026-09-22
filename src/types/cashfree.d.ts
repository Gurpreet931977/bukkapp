declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_top' | '_modal';
    appearance?: {
      width?: string;
      height?: string;
      style?: Record<string, any>;
    };
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<{
      error?: {
        message: string;
        code?: string;
      };
      paymentDetails?: any;
    }>;
    redirect(): void;
  }

  export function load(options: { mode: 'sandbox' | 'production' }): Promise<CashfreeInstance>;
}
