# EasyCater Mobile App - Functional Test Cases

Manual test matrix for the booking rules and flows. Run against `npx @ionic/cli serve`
(web) or a debug APK. "Pass" = actual result matches expected result exactly.

Booking rules under test (mirrored in `backend-api/src/controllers/bookingController.js`):

| Rule | Value |
| --- | --- |
| Lead time | Events must be booked at least **7 days** ahead |
| Complete details | Event date, venue name and venue address are required before review |
| Cancellation cut-off | Cancellations close **2 hours** before the event start |
| Paid = locked | Bookings with any payment (downpayment included) can no longer be cancelled |

## Test cases

| ID | Title | Precondition | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TC-01 | Date calendar enforces 7-day lead | Logged in (demo account), a package is selected | Open Booking screen, open the event date calendar | Dates earlier than today + 7 days are disabled; legend reads "Struck-through dates are fully booked - one event per day" |
| TC-02 | Cannot review with incomplete details | Booking screen open | Leave date/venue/address empty, observe the "Before you continue" checklist | Checklist items show as pending; "Review Order" stays disabled with note "Complete the checklist above to unlock this step" |
| TC-03 | Review unlocks when details are complete | Booking screen open | Fill date (7+ days ahead), venue name, address | All checklist items turn green; "Review Order" becomes enabled |
| TC-04 | Booking is created at the Cart step | Complete order reviewed from Booking screen | Tap "Review Order" then "Proceed to Payment" | A pending **unpaid** booking appears in My Bookings with a "Pay now" button; payment screen shows the booking total |
| TC-05 | Downpayment locks the booking | Pending unpaid booking on the Payment screen | Choose 50% downpayment, pay with GCash | The 50% amount is **fixed** (no editable input); receipt screen shows amount paid, reference number and remaining balance; My Bookings shows the booking as `partial` with "Locked - this booking is fixed: details and cancellation can no longer be changed" |
| TC-06 | Full payment marks booking paid | Pending unpaid booking | Pay the full amount | Receipt shows "Booking received!"; booking badge becomes `paid`; no balance row |
| TC-07 | Paid booking cannot be cancelled | Booking with downpayment or full payment | Look for a Cancel button on the booking card | No Cancel button; lock notice with the rule is shown instead |
| TC-08 | Cancellation cut-off (2 hours) | Seeded booking "General Tinio Covered Court" (starts ~1 hour from now) | Open My Bookings, find that booking | Cancel button is replaced by "Cancellation closed - events can only be cancelled more than 2 hours before the start time" |
| TC-09 | Free cancellation for unpaid future bookings | Pending unpaid booking more than 2 hours away | Tap "Cancel booking", confirm | Alert asks to confirm; after confirming, booking status becomes `cancelled` |
| TC-10 | Pay now completes an unpaid booking | Pending unpaid booking in My Bookings | Tap "Pay now", pay full amount | Payment screen opens for that booking; after paying, status becomes `paid` |
| TC-11 | Pricing formula unchanged | Any package and guest count | Review the Cart totals | subtotal = price x guests + add-ons; service charge = 10% of subtotal; VAT = 12% of (subtotal + service charge); total = sum |
| TC-12 | Receipt screen shows all details | Any successful payment | Observe the receipt screen | Booking number, package, date/time, venue, guests, paid now, reference, receipt date; lock note; "View my bookings" and "Back to home" work |
| TC-13 | Venue suggestions fill the field | Booking screen, venue field empty | Observe suggested venue chips, tap one | Venue name fills with the tapped venue; chips narrow as you type |
| TC-14 | Address limited to General Tinio | Booking screen | Open the Address dropdown | Only the 13 barangays of General Tinio, Nueva Ecija are offered; the stored address reads "Brgy. \<name\>, General Tinio, Nueva Ecija" |
| TC-15 | Star display matches the rating | Packages or Package Details screen | Compare the stars with the numeric rating | 5 stars shown: rating 4.8 = 4 full + 1 half; 4.4 = 4 full + 1 outline; 5.0 = 5 full; number matches the package rating |
| TC-16 | Booked dates show as taken | At least one active booking exists | Open the Booking screen calendar | Taken dates appear struck-through/disabled in the calendar; tapping one does not select it; picking a free date shows a green "\<date\> is available" confirmation and completes the date checklist item |
| TC-17 | Downpayment and balance are fixed amounts | Any booking on the Payment screen | Compare amounts for each option; try editing an amount | Full = exact total; 50% downpayment = exactly half; balance = exact remaining. No amount field is editable |
| TC-18 | Fully paid booking cannot be paid again | Booking with paymentStatus `paid` | Look for a pay action / try opening the payment screen for it | No pay button appears; opening the payment screen for it redirects to My Bookings with "This booking is already fully paid and locked." |
| TC-19 | Booking flow includes the menu step | Complete booking form, tap "Continue - add extras" | Observe the Menu screen, add an extra, tap "Review Order" | Menu shows "Adding extras for \<package\>" banner and a sticky Review Order CTA; added extras appear in the Cart order summary with updated totals; skipping is allowed (Review Order with 0 add-ons) |

## UX evaluation checklist (Nielsen's 10 heuristics)

Mapping of the lesson's heuristics to what was implemented:

| # | Heuristic | Implementation |
| --- | --- | --- |
| 1 | Visibility of system status | Loading states on booking creation and payment; conclusive receipt screen with booking number and time-stamped receipt |
| 2 | Match between system and the real world | Human-readable dates ("Earliest is Thu, Nov 13"), plain-language rules instead of jargon |
| 3 | User control and freedom | Confirm dialog before cancelling; booking stays editable until payment; unpaid bookings can still be cancelled or paid later |
| 4 | Consistency and standards | One PHP money format across screens; missing payment-method icons registered; every status has one badge style |
| 5 | Error prevention | Date picker constrained to valid dates; completeness checklist; disabled CTA with reason; lock warning shown **before** paying |
| 6 | Recognition rather than recall | Chosen package card on Booking; full order summary on Cart; checklist shows what is missing instead of requiring memory |
| 7 | Flexibility and efficiency | "Pay now" shortcut on unpaid bookings; demo account button; remembered draft across screens |
| 8 | Aesthetic and minimalist design | Rules shown as short inline hints, not paragraphs; one checklist card, no clutter |
| 9 | Help users recognize, diagnose and recover from errors | Plain-language validation messages ("Enter the venue name to continue"); failed payment keeps all user input |
| 10 | Help and documentation | Contextual help at the point of need (date hint, cut-off notice, lock explanation) instead of a manual |
