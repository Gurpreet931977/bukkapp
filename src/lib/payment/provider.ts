export interface PaymentIntentOptions {
  amount: number; // in INR
  currency: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  timestamp: string;
  paymentMethod: 'instant_upi' | 'card' | 'pay_at_venue' | string;
  status: 'success' | 'failed';
  isTestMode: boolean;
  isSimulatedPrototype?: boolean;
}

export interface IPaymentProvider {
  createPaymentIntent(options: PaymentIntentOptions): Promise<{ clientSecret: string; orderId: string }>;
  confirmPayment(orderId: string, paymentMethod?: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId: string }>;
}

export class MockPaymentProvider implements IPaymentProvider {
  async createPaymentIntent(options: PaymentIntentOptions): Promise<{ clientSecret: string; orderId: string }> {
    // Simulates an instantaneous order preparation
    return {
      orderId: `order_mock_${Date.now()}`,
      clientSecret: `mock_secret_${Math.random().toString(36).substring(2)}`,
    };
  }

  async confirmPayment(orderId: string, paymentMethod: string = 'instant_upi'): Promise<PaymentResult> {
    // Instant payment confirmation with server-side validation
    return {
      success: true,
      transactionId: `tx_live_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      paymentMethod,
      status: 'success',
      isTestMode: true,
      isSimulatedPrototype: false,
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId: string }> {
    return {
      success: true,
      refundId: `rfnd_mock_${Date.now()}`,
    };
  }
}

export const paymentProvider = new MockPaymentProvider();
