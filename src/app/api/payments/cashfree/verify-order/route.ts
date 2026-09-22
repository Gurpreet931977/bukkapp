import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { CashfreeService } from '@/lib/payment/cashfree';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, bookingId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required to verify payment' },
        { status: 400 }
      );
    }

    // Authoritative verification directly against Cashfree PG servers
    const verification = await CashfreeService.verifyOrder(orderId);

    if (!verification.isPaid) {
      return NextResponse.json({
        success: false,
        isPaid: false,
        orderStatus: verification.orderStatus,
        error: verification.error || 'Payment not completed or still processing on Cashfree',
      });
    }

    // Locate booking by bookingId or paymentOrderId
    let targetBooking = bookingId ? store.getBookingById(bookingId) : undefined;
    if (!targetBooking) {
      const allBookings = store.getAllBookings();
      targetBooking = allBookings.find((b) => b.paymentOrderId === orderId);
    }

    if (targetBooking) {
      store.updateBookingPayment(targetBooking.id, {
        paymentStatus: 'paid',
        paymentMethod: verification.paymentMethod || 'cashfree_upi',
        paymentOrderId: orderId,
        transactionId: verification.cfPaymentId || `CF-TXN-${Date.now()}`,
        paidAt: verification.paidAt || new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      isPaid: true,
      orderId,
      bookingId: targetBooking?.id,
      bookingReference: targetBooking?.bookingReference,
      transactionId: verification.cfPaymentId,
      paymentMethod: verification.paymentMethod,
      paidAt: verification.paidAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error during Cashfree verification' },
      { status: 500 }
    );
  }
}
