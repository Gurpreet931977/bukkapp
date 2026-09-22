import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { CashfreeService } from '@/lib/payment/cashfree';
import { sanitizeText, sanitizeSearchQuery } from '@/lib/security/sanitize';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessId,
      serviceId,
      customerName,
      customerPhone,
      customerEmail,
      date,
      startTime,
      specialRequests,
      userId,
    } = body;

    // Validate required fields
    if (!businessId || !serviceId || !customerName || !customerPhone || !date || !startTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking details for payment initialization' },
        { status: 400 }
      );
    }

    // Authoritatively retrieve business and service from single source of truth (Anti-Tampering)
    const business = store.getBusinessById(businessId) || store.getBusinessBySlug(businessId);
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const service = store.getServiceById(serviceId) || store.getServicesByBusinessId(business.id).find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    // Sanitize input strings
    const cleanCustomerName = sanitizeText(customerName);
    const cleanCustomerPhone = sanitizeText(customerPhone);
    const cleanCustomerEmail = customerEmail ? sanitizeText(customerEmail) : `${cleanCustomerPhone}@bukkapp.in`;
    const cleanNotes = specialRequests ? sanitizeText(specialRequests) : undefined;

    // Generate unique order reference
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `order_${timestamp}_${randomSuffix}`;

    // App URL for return redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/api/payments/cashfree/return?order_id={order_id}`;

    // Authoritatively create Cashfree Order using authoritative service.price
    const orderResult = await CashfreeService.createOrder({
      orderId,
      orderAmount: service.price,
      orderCurrency: 'INR',
      customer: {
        customer_id: userId ? sanitizeText(userId) : `cust_${cleanCustomerPhone.replace(/\D/g, '') || timestamp}`,
        customer_name: cleanCustomerName,
        customer_email: cleanCustomerEmail,
        customer_phone: cleanCustomerPhone,
      },
      orderMeta: {
        return_url: returnUrl,
        notify_url: `${appUrl}/api/payments/cashfree/webhook`,
      },
      orderNote: `Booking for ${service.name} at ${business.name}`,
    });

    if (!orderResult.success) {
      return NextResponse.json(
        { success: false, error: orderResult.error || 'Failed to initialize Cashfree payment order' },
        { status: 502 }
      );
    }

    // Pre-create atomic booking with 'pending' payment status
    try {
      const booking = store.createBookingAtomically({
        userId: userId || 'usr-guest',
        customerName: cleanCustomerName,
        customerPhone: cleanCustomerPhone,
        customerEmail: cleanCustomerEmail,
        business,
        service,
        date,
        startTime,
        specialRequests: cleanNotes,
        paymentStatus: 'pending',
        paymentMethod: 'cashfree',
        paymentOrderId: orderId,
      });

      return NextResponse.json({
        success: true,
        orderId: orderResult.orderId,
        paymentSessionId: orderResult.paymentSessionId,
        amount: orderResult.orderAmount,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        isSimulated: orderResult.isSimulated || false,
      });
    } catch (bookingErr: any) {
      return NextResponse.json(
        { success: false, error: bookingErr.message || 'Slot collision occurred. Please select another time.' },
        { status: 409 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error while preparing payment' },
      { status: 500 }
    );
  }
}
