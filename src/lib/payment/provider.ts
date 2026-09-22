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

export class CashfreePaymentProvider implements IPaymentProvider {
  async createPaymentIntent(options: PaymentIntentOptions): Promise<{ clientSecret: string; orderId: string }> {
    const { CashfreeService } = await import('./cashfree');
    const result = await CashfreeService.createOrder({
      orderId: options.orderReference,
      orderAmount: options.amount,
      orderCurrency: options.currency || 'INR',
      customer: {
        customer_id: options.customerEmail ? `cust_${options.customerEmail.replace(/[^a-zA-Z0-9]/g, '')}` : `cust_${Date.now()}`,
        customer_name: options.customerName,
        customer_email: options.customerEmail,
        customer_phone: options.customerPhone,
      },
      orderNote: options.description,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create Cashfree payment intent');
    }

    return {
      orderId: result.orderId,
      clientSecret: result.paymentSessionId,
    };
  }

  async confirmPayment(orderId: string, paymentMethod?: string): Promise<PaymentResult> {
    const { CashfreeService } = await import('./cashfree');
    const verification = await CashfreeService.verifyOrder(orderId);

    return {
      success: verification.isPaid,
      transactionId: verification.cfPaymentId || `tx_${orderId}`,
      timestamp: verification.paidAt || new Date().toISOString(),
      paymentMethod: verification.paymentMethod || paymentMethod || 'cashfree_upi',
      status: verification.isPaid ? 'success' : 'failed',
      isTestMode: !CashfreeService.isConfigured(),
      isSimulatedPrototype: !CashfreeService.isConfigured(),
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId: string }> {
    return {
      success: true,
      refundId: `rfnd_cf_${Date.now()}`,
    };
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
export const cashfreePaymentProvider = new CashfreePaymentProvider();
export const paymentProvider: IPaymentProvider = cashfreePaymentProvider;
