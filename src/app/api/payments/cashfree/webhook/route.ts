import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { CashfreeService } from '@/lib/payment/cashfree';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';

    // Verify webhook authenticity if keys are configured
    if (CashfreeService.isConfigured()) {
      const isValid = CashfreeService.verifyWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Cashfree webhook signature' }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.type;
    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' && orderData?.order_id) {
      const orderId = orderData.order_id;
      const cfPaymentId = paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : undefined;
      const paymentTime = paymentData?.payment_time || new Date().toISOString();

      let paymentMethod = 'cashfree_online';
      if (paymentData?.payment_method?.upi) {
        paymentMethod = 'cashfree_upi';
      } else if (paymentData?.payment_method?.card) {
        paymentMethod = 'cashfree_card';
      } else if (paymentData?.payment_method?.netbanking) {
        paymentMethod = 'cashfree_netbanking';
      }

      const allBookings = store.getAllBookings();
      const targetBooking = allBookings.find((b) => b.paymentOrderId === orderId);

      if (targetBooking) {
        store.updateBookingPayment(targetBooking.id, {
          paymentStatus: 'paid',
          paymentMethod,
          transactionId: cfPaymentId || `CF-TXN-${Date.now()}`,
          paidAt: paymentTime,
        });
      }
    }

    return NextResponse.json({ received: true, event: eventType });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
