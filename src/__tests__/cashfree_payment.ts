import { CashfreeService, normalizeCashfreePhone } from '../lib/payment/cashfree';
import { cashfreePaymentProvider } from '../lib/payment/provider';
import { store } from '../lib/db/store';
import crypto from 'crypto';

export function runCashfreePaymentTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  console.log('\n--- 1. CASHFREE PHONE NUMBER NORMALIZATION ---');
  assert(
    normalizeCashfreePhone('9876543210') === '9876543210',
    'Standard 10-digit phone normalized cleanly'
  );
  assert(
    normalizeCashfreePhone('+91 98765 43210') === '9876543210',
    'Leading +91 country code and spaces stripped to 10 digits'
  );
  assert(
    normalizeCashfreePhone('919876543210') === '9876543210',
    'Leading 91 prefix without plus stripped to 10 digits'
  );
  assert(
    normalizeCashfreePhone('(987) 654-3210') === '9876543210',
    'Hyphens and parentheses stripped properly'
  );

  console.log('\n--- 2. CASHFREE ORDER CREATION ENGINE ---');
  let testOrderId = `order_test_${Date.now()}`;
  const createPromise = CashfreeService.createOrder({
    orderId: testOrderId,
    orderAmount: 499.5,
    orderCurrency: 'INR',
    customer: {
      customer_id: 'cust_test_123',
      customer_name: 'Gurpreet Singh',
      customer_email: 'gurpreet@bukkapp.in',
      customer_phone: '+91 98765 43210',
    },
    orderNote: 'Test Booking for Smile Studio',
  });

  return (async () => {
    const orderResult = await createPromise;
    assert(orderResult.success === true, 'Order created successfully');
    assert(orderResult.orderId === testOrderId, 'Order ID matches requested reference');
    assert(orderResult.orderAmount === 499.5, 'Authoritative order amount preserved to 2 decimals');
    assert(typeof orderResult.paymentSessionId === 'string' && orderResult.paymentSessionId.length > 0, 'Generates valid paymentSessionId');
    assert(orderResult.orderStatus === 'ACTIVE', 'Initial order status is ACTIVE');

    console.log('\n--- 3. CASHFREE ORDER VERIFICATION ENGINE ---');
    const verification = await CashfreeService.verifyOrder(testOrderId);
    assert(verification.success === true, 'Verification query succeeds');
    assert(verification.isPaid === true, 'Order payment verified');
    assert(typeof verification.cfPaymentId === 'string', 'Returns verified cfPaymentId');
    assert(typeof verification.paymentMethod === 'string', 'Returns paymentMethod details');

    console.log('\n--- 4. CASHFREE WEBHOOK CRYPTOGRAPHIC SIGNATURE ---');
    const mockSecret = 'cf_secret_key_mock_12345';
    const testPayload = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: testOrderId },
        payment: { cf_payment_id: 998877, payment_status: 'SUCCESS' },
      },
    });
    const testTimestamp = `${Date.now()}`;
    const validSignature = crypto
      .createHmac('sha256', mockSecret)
      .update(`${testTimestamp}${testPayload}`)
      .digest('base64');

    // Test with configured secret
    const originalSecret = process.env.CASHFREE_SECRET_KEY;
    process.env.CASHFREE_SECRET_KEY = mockSecret;

    const signatureValid = CashfreeService.verifyWebhookSignature(testPayload, validSignature, testTimestamp);
    assert(signatureValid === true, 'Valid HMAC-SHA256 webhook signature verified');

    const invalidSignature = CashfreeService.verifyWebhookSignature(testPayload, 'tampered_signature_xyz', testTimestamp);
    assert(invalidSignature === false, 'Tampered webhook signature rejected');

    process.env.CASHFREE_SECRET_KEY = originalSecret;

    console.log('\n--- 5. UNIFIED PAYMENT PROVIDER INTEGRATION ---');
    const intentResult = await cashfreePaymentProvider.createPaymentIntent({
      amount: 600,
      currency: 'INR',
      orderReference: `order_prov_${Date.now()}`,
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '9876543210',
      description: 'Consultation Booking',
    });
    assert(typeof intentResult.orderId === 'string', 'PaymentProvider returns orderId');
    assert(typeof intentResult.clientSecret === 'string', 'PaymentProvider returns clientSecret session');

    const confirmResult = await cashfreePaymentProvider.confirmPayment(intentResult.orderId);
    assert(confirmResult.success === true, 'Payment confirmation succeeds');
    assert(confirmResult.status === 'success', 'PaymentResult status is success');
    assert(confirmResult.paymentMethod.startsWith('cashfree'), 'PaymentResult paymentMethod is cashfree');

    console.log('\n--- 6. ATOMIC BOOKING PAYMENT STATE PERSISTENCE ---');
    const testBiz = store.getBusinesses()[0];
    const testSrv = store.getServicesByBusinessId(testBiz.id)[0];
    const newBooking = store.createBookingAtomically({
      userId: 'usr-test-cashfree',
      customerName: 'Pooja Rawat',
      customerPhone: '9876512345',
      customerEmail: 'pooja@example.com',
      business: testBiz,
      service: testSrv,
      date: '2026-09-30',
      startTime: '11:00',
      paymentStatus: 'pending',
      paymentOrderId: intentResult.orderId,
    });
    assert(newBooking.paymentStatus === 'pending', 'Booking created with pending payment status');

    const updatedBooking = store.updateBookingPayment(newBooking.id, {
      paymentStatus: 'paid',
      paymentMethod: 'cashfree_upi',
      transactionId: 'CF-TXN-987654321',
      paidAt: new Date().toISOString(),
    });
    assert(updatedBooking.paymentStatus === 'paid', 'Booking payment updated to paid');
    assert(updatedBooking.paymentMethod === 'cashfree_upi', 'Booking paymentMethod recorded');
    assert(updatedBooking.transactionId === 'CF-TXN-987654321', 'Booking transactionId recorded');

    return { passed, failed };
  })() as any;
}
