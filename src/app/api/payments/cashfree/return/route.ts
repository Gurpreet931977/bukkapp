import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { CashfreeService } from '@/lib/payment/cashfree';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/search`);
  }

  try {
    const verification = await CashfreeService.verifyOrder(orderId);

    const allBookings = store.getAllBookings();
    const targetBooking = allBookings.find((b) => b.paymentOrderId === orderId);

    if (verification.isPaid && targetBooking) {
      store.updateBookingPayment(targetBooking.id, {
        paymentStatus: 'paid',
        paymentMethod: verification.paymentMethod || 'cashfree_upi',
        transactionId: verification.cfPaymentId || `CF-TXN-${Date.now()}`,
        paidAt: verification.paidAt || new Date().toISOString(),
      });

      return NextResponse.redirect(`${appUrl}/booking/${targetBooking.id}?payment=success`);
    }

    if (targetBooking) {
      return NextResponse.redirect(
        `${appUrl}/book/${targetBooking.businessSlug}/${targetBooking.serviceId}?payment_error=${encodeURIComponent(
          verification.error || 'Payment was not completed. Please try again.'
        )}`
      );
    }

    return NextResponse.redirect(`${appUrl}/account`);
  } catch {
    return NextResponse.redirect(`${appUrl}/search`);
  }
}
