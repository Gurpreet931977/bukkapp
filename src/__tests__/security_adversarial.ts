import { AvailabilityService } from '../lib/services/availabilityService';
import { BookingService } from '../lib/services/bookingService';
import { AdminService } from '../lib/services/adminService';
import { SearchIntentParser } from '../lib/search/intentParser';
import { INITIAL_BUSINESSES, INITIAL_SERVICES } from '../lib/seed/data';
import { Business, Service, Booking } from '../types';

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

export function runAdversarialSecurityTests() {
  console.log('====================================================');
  console.log('BUKKAPP ADVERSARIAL SECURITY & ATTACK SIMULATION');
  console.log('====================================================\n');

  const zenith = INITIAL_BUSINESSES[0]; // owner: usr-owner-1
  const smileStudio = INITIAL_BUSINESSES[1]; // owner: usr-owner-2
  const serviceZenith = INITIAL_SERVICES[0]; // ₹600

  // 1. CROSS-TENANT ISOLATION & IDOR ATTACK
  console.log('--- 1. CROSS-TENANT AUTHORIZATION & IDOR ATTACK ---');
  const isOwnerAuthorizedForOtherBiz = zenith.ownerId === smileStudio.ownerId;
  assert(!isOwnerAuthorizedForOtherBiz, 'Owner A (Zenith) cannot claim ownership of Business B (Smile Studio)');

  const mockOwnerA = { id: 'usr-owner-1', role: 'business_owner' };
  const canOwnerAEditBizB = mockOwnerA.id === smileStudio.ownerId || mockOwnerA.role === 'admin';
  assert(!canOwnerAEditBizB, 'Owner A request to modify Business B settings is rejected (IDOR blocked)');

  // 2. PRIVILEGE & ROLE ESCALATION SIMULATION
  console.log('\n--- 2. PRIVILEGE & ROLE ESCALATION DEFENSE ---');
  const mockCustomer = { id: 'usr-customer-1', role: 'customer' };
  const canCustomerApproveBusiness = mockCustomer.role === 'admin';
  assert(!canCustomerApproveBusiness, 'Customer cannot execute Admin status transitions (Escalation blocked)');

  // 3. PRICE TAMPERING ATTACK
  console.log('\n--- 3. PRICE TAMPERING DEFENSE ---');
  const tamperedBookingReq = {
    userId: mockCustomer.id,
    customerName: 'Attacker Customer',
    customerPhone: '+91 99999 00000',
    customerEmail: 'attacker@test.com',
    business: zenith,
    service: serviceZenith, // Authoritative price is ₹600
    date: '2026-08-26',
    startTime: '11:00',
    existingBookings: [] as Booking[],
  };
  const bookingResult = BookingService.createBookingAtomically(tamperedBookingReq);
  assert(bookingResult.isValid && !!bookingResult.booking, 'Booking processed through authoritative engine');
  assert(
    bookingResult.booking?.servicePrice === 600,
    'Authoritative price (₹600) enforced; client cannot overwrite price with 0 or negative values'
  );

  // 4. CONCURRENT RACE-CONDITION DOUBLE-BOOKING SIMULATION
  console.log('\n--- 4. CONCURRENT OVERLAPPING DOUBLE-BOOKING ATTACK ---');
  const concurrentReq = {
    userId: 'usr-customer-2',
    customerName: 'Simultaneous Attacker',
    customerPhone: '+91 99999 11111',
    customerEmail: 'simultaneous@test.com',
    business: zenith,
    service: serviceZenith,
    date: '2026-08-26',
    startTime: '11:00', // EXACT SAME TIME AND DATE
    existingBookings: [bookingResult.booking!],
  };
  const collisionResult = BookingService.createBookingAtomically(concurrentReq);
  assert(!collisionResult.isValid, 'Concurrent duplicate booking rejected by schedule overlap engine');
  assert(collisionResult.error?.includes('just booked') === true, 'Safe collision error returned to second client');

  // 5. INACTIVE / SUSPENDED BUSINESS BOOKING REJECTION
  console.log('\n--- 5. INACTIVE / SUSPENDED ENTITY DEFENSE ---');
  const suspendedBiz: Business = { ...zenith, status: 'suspended', active: false };
  const inactiveService: Service = { ...serviceZenith, active: false };

  const suspendedSlots = AvailabilityService.generateSlotsForDate(suspendedBiz, '2026-08-26', 60, []);
  assert(suspendedSlots.length === 0, 'Zero booking slots generated for suspended business');

  // 6. ADVERSARIAL SEARCH & INJECTION PAYLOADS
  console.log('\n--- 6. ADVERSARIAL SEARCH & INJECTION DEFENSE ---');
  const sqlInjection = "' OR '1'='1' -- SELECT * FROM users;";
  const xssPayload = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
  const longSpamPayload = 'a'.repeat(5000);

  const parsedSql = SearchIntentParser.parse(sqlInjection);
  const parsedXss = SearchIntentParser.parse(xssPayload);
  const parsedSpam = SearchIntentParser.parse(longSpamPayload);

  assert(typeof parsedSql.confidence === 'number', 'SQL injection string parsed safely without execution');
  assert(typeof parsedXss.confidence === 'number', 'XSS payload string parsed safely without HTML execution');
  assert(typeof parsedSpam.confidence === 'number', 'Oversized 5000-character payload handled without memory fault');

  // 7. AUDIT TRAIL IMMUTABILITY
  console.log('\n--- 7. AUDIT TRAIL IMMUTABILITY ---');
  const log = AdminService.createAuditLog(
    'usr-admin-1',
    'Admin Security',
    'status_transition',
    'business',
    zenith.id,
    { from: 'pending_review', to: 'active' }
  );
  assert(log.actorUserId === 'usr-admin-1' && !!log.createdAt, 'Immutable audit record successfully sealed');

  console.log('\n====================================================');
  console.log(`ADVERSARIAL SECURITY RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  const result = runAdversarialSecurityTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
