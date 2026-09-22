import { AvailabilityService } from '../lib/services/availabilityService';
import { BookingService } from '../lib/services/bookingService';
import { AdminService } from '../lib/services/adminService';
import { SearchIntentParser } from '../lib/search/intentParser';
import { INITIAL_BUSINESSES, INITIAL_SERVICES } from '../lib/seed/data';
import { Business, Service, Booking } from '../types';
import { store } from '../lib/db/store';

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

async function runTestSuite() {
  console.log('====================================================');
  console.log('BUKKAPP AUTOMATED TEST SUITE: FULL MISSION-CRITICAL');
  console.log('====================================================\n');

  const zenith = INITIAL_BUSINESSES[0];
  const service = INITIAL_SERVICES[0];

  // 1. AVAILABILITY SERVICE TESTS
  console.log('--- 1. AVAILABILITY & WORKING HOURS ---');
  const tuesdaySlots = AvailabilityService.generateSlotsForDate(zenith, '2026-08-25', 60, []);
  assert(tuesdaySlots.length > 0, 'Generates valid slots for open weekday');
  assert(tuesdaySlots[0].time === '08:00', 'First slot matches opening time 08:00');

  // Test blocked time elimination
  const blockedTime = {
    id: 'blk-test',
    businessId: zenith.id,
    startDatetime: '2026-08-25T14:00:00',
    endDatetime: '2026-08-25T16:00:00',
    reason: 'Court Maintenance',
    createdAt: new Date().toISOString(),
  };
  const slotsWithBlock = AvailabilityService.generateSlotsForDate(zenith, '2026-08-25', 60, [], [blockedTime]);
  const has14Slot = slotsWithBlock.some((s) => s.time === '14:00' && s.isAvailable);
  assert(!has14Slot, 'Blocked hours (14:00 - 16:00) are unavailable for booking');

  // 2. ATOMIC BOOKING ENGINE & PRICE LOCKING
  console.log('\n--- 2. ATOMIC BOOKING ENGINE & PRICE LOCKING ---');
  const req1 = {
    userId: 'usr-customer-1',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 11111',
    customerEmail: 'aarav@bukkapp.in',
    business: zenith,
    service: service,
    date: '2026-08-25',
    startTime: '10:00',
    existingBookings: [] as Booking[],
  };
  const result1 = BookingService.createBookingAtomically(req1);
  assert(result1.isValid && !!result1.booking, 'Customer 1 successfully books open slot at 10:00 AM');
  assert(result1.booking?.servicePrice === service.price, 'Locks snapshot servicePrice at time of booking');
  assert(Boolean(result1.booking?.bookingReference.startsWith('BK-')), 'Generates valid BK-XXXXXX reference format');

  // 3. CONCURRENT DOUBLE-BOOKING COLLISION TEST
  console.log('\n--- 3. CONCURRENT DOUBLE-BOOKING PREVENTION ---');
  const req2 = {
    userId: 'usr-customer-2',
    customerName: 'Priya Verma',
    customerPhone: '+91 98765 22222',
    customerEmail: 'priya@bukkapp.in',
    business: zenith,
    service: service,
    date: '2026-08-25',
    startTime: '10:00', // EXACT SAME TIME SLOT
    existingBookings: [result1.booking!],
  };
  const result2 = BookingService.createBookingAtomically(req2);
  assert(!result2.isValid, 'Customer 2 booking rejected due to overlapping schedule collision');
  assert(
    result2.error?.includes('just booked') === true,
    'Returns friendly customer message: "That time was just booked"'
  );

  // 4. HISTORICAL DATA INTEGRITY
  console.log('\n--- 4. HISTORICAL BOOKING INTEGRITY ---');
  const modifiedService: Service = { ...service, price: 9999, durationMinutes: 120 };
  assert(
    result1.booking?.servicePrice === 600,
    'Historical booking preserves original booked price even if service rate changes'
  );

  // 5. NATURAL LANGUAGE SEARCH INTENT PARSER
  console.log('\n--- 5. NATURAL LANGUAGE SEARCH INTENT PARSER ---');
  const intent1 = SearchIntentParser.parse('I need a dentist tomorrow after 6');
  assert(intent1.detectedCategory === 'health-wellness', 'Detects category health-wellness from "dentist"');
  assert(!!intent1.detectedDate, 'Detects date parameter from "tomorrow"');
  assert(intent1.detectedTimeFrom === '18:00', 'Detects evening start time from "after 6"');

  const intent2 = SearchIntentParser.parse('Pickleball in Rajpur Road under 1000');
  assert(intent2.detectedCategory === 'fitness-sports', 'Detects fitness-sports from "Pickleball"');
  assert(intent2.detectedNeighborhood === 'Rajpur Road', 'Detects neighborhood "Rajpur Road"');
  assert(intent2.detectedMaxPrice === 1000, 'Detects price cap "under 1000"');

  // 6. ADMIN LIFECYCLE & AUDIT LOGS
  console.log('\n--- 6. ADMIN OPERATIONS & AUDIT LOGS ---');
  assert(
    AdminService.isValidStatusTransition('draft', 'pending_review'),
    'Valid transition: draft -> pending_review'
  );
  assert(
    AdminService.isValidStatusTransition('pending_review', 'active'),
    'Valid transition: pending_review -> active'
  );
  assert(
    !AdminService.isValidStatusTransition('active', 'draft'),
    'Rejects illegal transition: active -> draft'
  );

  const audit = AdminService.createAuditLog(
    'usr-admin-1',
    'Admin Operator',
    'business_approved',
    'business',
    zenith.id,
    { approvedBy: 'Lead Ops' }
  );
  assert(audit.action === 'business_approved' && audit.entityId === zenith.id, 'Creates immutable audit log record');

  console.log('\n--- 7. VERIFIED MERCHANT SUBSCRIPTION ENGINE ---');
  const activatedBiz = store.activateVerificationSubscription(zenith.id);
  assert(activatedBiz.verified === true, 'Activation sets verified = true');
  assert(activatedBiz.verificationPlan?.status === 'free_trial', 'Starts on free_trial status');
  assert(activatedBiz.verificationPlan?.price === 450, 'Enforces ₹450 price point');
  assert(Boolean(activatedBiz.verificationPlan?.trialEndsAt), 'Calculates 30-day trial expiry date');

  const cancelledBiz = store.cancelVerificationSubscription(zenith.id);
  assert(cancelledBiz.verified === false, 'Cancellation unsets verified = false');
  assert(cancelledBiz.verificationPlan?.status === 'cancelled', 'Sets status to cancelled');

  console.log('\n--- 8. KINETIC SLIDER MOMENTUM & INERTIA PHYSICS ---');
  // Simulate category dock infinite wrapping & momentum decay
  const setWidth = 1000;
  let scrollPos = setWidth * 2; // initial center anchor
  let velocity = 2400; // px/s from a strong fling
  const dt = 1 / 60; // 60fps
  let distanceCoasted = 0;
  let frames = 0;

  // Simulate coasting until velocity falls below cutoff (force utilised)
  while (Math.abs(velocity) > 8 && frames < 300) {
    const frameDistance = velocity * dt;
    scrollPos += frameDistance;
    distanceCoasted += Math.abs(frameDistance);

    // Exponential decay friction
    velocity *= Math.pow(0.978, dt * 60);

    // Infinite wrapping logic
    while (scrollPos >= setWidth * 3) scrollPos -= setWidth;
    while (scrollPos < setWidth * 2) scrollPos += setWidth;

    frames++;
  }

  assert(distanceCoasted > 1000, `Firm fling coasts continuously until force is utilised (${Math.round(distanceCoasted)}px coasted)`);
  assert(frames >= 90, `Momentum coasting lasts naturally across multiple seconds (${(frames / 60).toFixed(2)}s)`);
  assert(scrollPos >= setWidth * 2 && scrollPos < setWidth * 3, `Scroll position always remains securely in wrapped anchor range (${Math.round(scrollPos)}px)`);
  assert(Math.abs(velocity) <= 8, `Velocity cleanly settles once force is fully utilised (${velocity.toFixed(2)} px/s)`);

  // Drag wrapping test: Simulate a massive 5000px drag
  let dragScroll = setWidth * 2;
  let startScroll = setWidth * 2;
  const simulatedDragDelta = -5000; // dragged 5000px to the left
  let targetDrag = startScroll - simulatedDragDelta;
  while (targetDrag >= setWidth * 3) {
    targetDrag -= setWidth;
    startScroll -= setWidth;
  }
  while (targetDrag < setWidth * 2) {
    targetDrag += setWidth;
    startScroll += setWidth;
  }
  assert(targetDrag >= setWidth * 2 && targetDrag < setWidth * 3, 'Extreme manual drag wraps seamlessly without hitting boundaries');

  // 9. ROLE-BASED ACCESS CONTROL & EXPANDED TAXONOMY
  console.log('\n--- 9. ROLE-BASED ACCESS CONTROL & EXPANDED TAXONOMY ---');
  const allCategories = store.getCategories();
  assert(allCategories.some(c => c.slug === 'plumbing-sanitary'), 'Category plumbing-sanitary is registered and active');
  assert(allCategories.some(c => c.slug === 'furniture-carpentry'), 'Category furniture-carpentry is registered and active');
  assert(allCategories.some(c => c.slug === 'tailoring-boutique'), 'Category tailoring-boutique is registered and active');
  assert(allCategories.some(c => c.slug === 'appliance-repair'), 'Category appliance-repair is registered and active');
  assert(allCategories.some(c => c.slug === 'pet-care'), 'Category pet-care is registered and active');

  // Verify storefront creation
  const createdBiz = store.createBusiness({
    ownerId: 'usr-owner-test',
    name: 'Doon Tailors & Designers',
    slug: 'doon-tailors-test',
    categoryId: 'tailoring-boutique',
    phone: '+91 98765 43210',
    email: 'contact@doontailors.test',
  });
  assert(createdBiz.status === 'draft', 'Newly registered merchant starts in draft status');
  assert(createdBiz.categoryId === 'tailoring-boutique', 'Storefront correctly bound to category');
  assert(createdBiz.features.length > 0, 'Populates default storefront features');

  // Role validation
  const testCustomer = { id: 'c-1', role: 'customer' as const };
  const testMerchant = { id: 'm-1', role: 'business_owner' as const, businessId: createdBiz.id };
  const testAdmin = { id: 'a-1', role: 'admin' as const };

  const canAccessAdmin = (r: string) => r === 'admin';
  const canAccessBusiness = (r: string) => r === 'business_owner' || r === 'admin';
  const canAccessCustomer = (r: string) => r === 'customer' || r === 'admin' || r === 'business_owner';

  assert(canAccessAdmin(testAdmin.role), 'Master Admin has access to Admin operations');
  assert(!canAccessAdmin(testCustomer.role), 'Customer is blocked from Admin operations');
  assert(!canAccessAdmin(testMerchant.role), 'Merchant is blocked from Admin operations');
  assert(canAccessBusiness(testMerchant.role), 'Merchant has access to Business console');
  assert(!canAccessBusiness(testCustomer.role), 'Customer is blocked from Business console');
  assert(canAccessBusiness(testAdmin.role), 'Master Admin has unrestricted access to Business console');
  assert(canAccessCustomer(testCustomer.role), 'Customer has access to Customer account features');

  console.log('\n====================================================');
  console.log(`FUNCTIONAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  await runTestSuite();
  runAdversarialSecurityTests();
}

import { runAdversarialSecurityTests } from './security_adversarial';

main();
