# BUKKAPP Automated Testing & QA Matrix

## 1. How to Run Automated Tests

To execute the complete mission-critical test suite:
```bash
npm test
```

---

## 2. Test Coverage Matrix

| Test Domain | Test Name | Expected Behavior | Status |
|---|---|---|---|
| **Availability** | Regular Weekday Slots | Generates discrete slots based on opening hours | PASS |
| **Availability** | Blocked Hours | Omit slots during maintenance or private closures | PASS |
| **Booking Engine** | Atomic Creation | Creates valid confirmed booking with price snapshot | PASS |
| **Booking Engine** | Reference Code | Formats references as `BK-XXXXXX` | PASS |
| **Concurrency** | Double-Booking Prevention | Second conflicting booking fails with friendly collision message | PASS |
| **Integrity** | Historical Snapshot | Preserves original price even if business changes rate later | PASS |
| **Search Parser** | Category Detection | Detects `health-wellness` from "dentist" | PASS |
| **Search Parser** | Time Range Detection | Detects `18:00` start time from "after 6" | PASS |
| **Search Parser** | Price Cap Detection | Detects maximum budget from "under 1000" | PASS |
| **Admin Operations** | Status Transitions | Validates `draft` -> `pending_review` -> `active` | PASS |
| **Admin Operations** | Security Guard | Blocks illegal status transitions (`active` -> `draft`) | PASS |
| **Admin Operations** | Audit Trail | Produces immutable audit log record | PASS |

---

## 3. Manual End-to-End Persona Testing Workflow

1. **Customer Persona**:
   - Open `/search`, filter by `Fitness & Sports`.
   - Open **Zenith Pickleball Club**, select **Standard Court Session (60 Mins)**.
   - Choose a time slot, enter name and phone, confirm booking.
   - Verify appointment ticket page loads with `.ics` download link.
2. **Business Owner Persona**:
   - Switch persona to **Rahul Kapoor** (Owner of Zenith Pickleball Club).
   - Open `/business/dashboard`, verify today's booking counter increments.
   - Open `/business/bookings`, verify customer booking appears in table.
   - Open `/business/availability`, test 1-click **"Copy Monday to weekdays"**.
3. **Admin Persona**:
   - Switch persona to **BUKKAPP Admin**.
   - Open `/admin`, verify marketplace bookings stream has the new booking.
   - Verify audit log contains entry.
