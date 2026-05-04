# PALI — Manual Test Script
**App URL:** http://localhost:3001  
**Purpose:** End-to-end browser verification of all flows  
**Estimated time:** ~90 minutes for full run  

---

## SETUP

**You need:**
- Two browser profiles open side by side:
  - **Profile A** — buyer / referrer account (regular user)
  - **Profile B** — admin account
- Two email addresses (Gmail + alias, or two real inboxes)
- F12 console open on both — watch for red errors throughout
- A phone number for form fields

**Mark each test:** ✅ PASS / ❌ FAIL / ⚠️ NOTE

---

---

## FLOW 1 — HOMEPAGE & NAVIGATION

### F1.1 — Homepage loads
1. Go to http://localhost:3001
- [ ] Product image (or "P" badge), name, description, price visible
- [ ] "קנה עכשיו" yellow button visible
- [ ] "הוסף לעגלה" outline button visible
- [ ] 3 trust badges visible (תשלום מאובטח, משלוח מהיר, אלפי לקוחות מרוצים)
- [ ] No red errors in console

### F1.2 — Header links
- [ ] Top bar: "איפה החבילה שלי?" → navigates to `/track`
- [ ] Top bar: "שאלות ותשובות" → navigates to `/faq`
- [ ] Press Back to return to homepage

### F1.3 — Search bar
1. Click the search input in the header
2. Type a keyword (e.g. `ספר` or first word of the product name)
3. Press Enter
- [ ] Navigates to `/search?q=...`
- [ ] Results appear (or "לא נמצאו מוצרים" if no match)
4. Click a result card
- [ ] Navigates to homepage `/` (search cards link to homepage)
5. Go back, search for `xyzxyz999abc`
- [ ] "לא נמצאו מוצרים" shown — no crash

### F1.4 — Cart icon (empty)
1. Hover over the cart icon (top right)
- [ ] Shows "העגלה ריקה"

### F1.5 — Footer
1. Scroll to the bottom of the page
- [ ] Copyright text present
- [ ] "תנאי שימוש" → `/terms` ✓
- [ ] "מדיניות פרטיות" → `/terms` ✓ (both link to terms)
- [ ] "שאלות ותשובות" → `/faq` ✓

---

---

## FLOW 2 — AUTHENTICATION

### F2.1 — Login page
1. Go to http://localhost:3001/auth/login (Profile A — not logged in)
- [ ] Page shows email input + "שלח לי קישור כניסה" button

### F2.2 — Magic link
1. Enter your email address
2. Click "שלח לי קישור כניסה"
- [ ] Button shows spinner while sending
- [ ] "הקישור נשלח!" confirmation appears

### F2.3 — Click magic link → logged in
1. Open your email, click the magic link
- [ ] Redirected to the app
- [ ] "האזור שלי" dropdown now visible in header (not "כניסה")
- [ ] Click "האזור שלי" → dropdown shows your email + points balance

### F2.4 — Protected pages redirect when logged out (Profile A — log out first)
1. Log out (האזור שלי → התנתק)
2. Try going directly to: `/dashboard`, `/wallet`, `/profile`, `/orders`
- [ ] Each one redirects to `/auth/login?redirect=...`
3. Log back in via the magic link

### F2.5 — Admin blocked for regular users (Profile A)
1. While logged in as regular user, go to http://localhost:3001/admin
- [ ] Redirected — admin content NOT shown

---

---

## FLOW 3 — COMPLETE PURCHASE (Buy Now)

> **This is the core flow. Do this carefully.**

### F3.1 — Open order dialog
1. On homepage, click "קנה עכשיו"
- [ ] Dialog opens with: product name + price summary, שם מלא, אימייל, טלפון, כתובת
- [ ] "אשר הזמנה – ₪XX" confirm button
- [ ] Dialog can be closed (X or click outside)

### F3.2 — Form validation
1. Click "אשר הזמנה" with all fields empty
- [ ] Form does NOT submit — required fields highlighted
2. Fill only some fields → same result

### F3.3 — Complete order (not logged in — open incognito for this test)
1. In an incognito window, go to homepage
2. Click "קנה עכשיו"
3. Fill: שם מלא, אימייל, טלפון (050-XXXXXXX), כתובת
4. Click "אשר הזמנה"
- [ ] Button shows "שולח הזמנה..." spinner — disabled, can't double-click
- [ ] Redirected to `/orders/[order-id]`
- [ ] Order confirmation page shows: order ID, product name, amount, your name, email
- [ ] "📦 המוצר יישלח תוך 3–5 ימי עסקים" note
- [ ] Yellow "מגיעה לך מתנה חינם!" box visible
- [ ] No green referral banner (no referral code used)
- [ ] **Copy the order ID from the URL — you'll need it later**

### F3.4 — Order confirmation with points (logged-in user with balance)
> Skip if you have 0 points. Come back after completing Flow 6 (gift claim).

1. Log in as Profile A (with points balance)
2. Click "קנה עכשיו"
- [ ] Green box appears: "יתרת נקודות: X"
- [ ] Number input shows, max = min(balance, product price)
3. Enter some points (e.g. 10)
- [ ] "אשר הזמנה – ₪XX (חיסכון: ₪YY)" shows discounted price
4. Submit order
- [ ] Go to `/wallet` → balance decreased by the points used
- [ ] New "מימוש" (orange badge) transaction in history

---

---

## FLOW 4 — GIFT CLAIM FLOW

> Continue from F3.3 order confirmation page

### F4.1 — Gift selection page
1. On the order confirmation page, click "בחר מתנה"
- [ ] Navigates to `/gift?order=[order-id]`
- [ ] Loading spinner appears briefly while items load
- [ ] Gift items displayed with images/placeholders and names
- [ ] Out-of-stock items show "אזל המלאי" badge and cannot be selected

### F4.2 — Select a gift
1. Click on an in-stock gift item
- [ ] Yellow border highlights the selected item ✓ checkmark appears
- [ ] Form appears below: שם מלא, טלפון, אימייל, כתובת

### F4.3 — Submit gift claim
1. Fill in all 4 fields
2. Click "שלחו לי את המתנה! 🎁"
- [ ] Full-screen loading: "מכין את המתנה שלך..." with spinner
- [ ] Redirected to `/welcome?code=...&url=...`

### F4.4 — Welcome page
- [ ] "ברכותינו! 🎉" header shown
- [ ] Personal referral link displayed in yellow box
- [ ] "העתק" button → copies link, button briefly shows "הועתק!"
  - Paste somewhere to verify link looks like: `http://localhost:3001/share/XXXXXX`
- [ ] "שתף בוואטסאפ" green button → opens WhatsApp with pre-filled text containing the link
- [ ] "שתף בפייסבוק" blue button → opens Facebook sharer
- [ ] 3-step "כך מרוויחים?" explanation visible
- [ ] "לדשבורד שלי" button → navigates to `/dashboard`

### F4.5 — Welcome email
1. Check the inbox of the email you used in the gift form
- [ ] Email arrives within 1–2 minutes with the referral link

### F4.6 — Gift CTA disappears after claiming
1. Go back to the order confirmation page: `/orders/[order-id]`
- [ ] Yellow "מגיעה לך מתנה" box is GONE — cannot claim again

### F4.7 — Gift page with already-claimed order
1. Manually go to `/gift?order=[same-order-id]`
- [ ] Redirected to the order confirmation page — gift selection UI NOT shown

### F4.8 — Gift page edge cases
1. Go to `/gift` (no query string)
- [ ] Redirected to homepage immediately
2. Go to `/gift?order=FAKEID`
- [ ] Shows "הזמנה לא תקפה" error message — not a crash, not a silent redirect

### F4.9 — Anti-abuse: one gift per phone
1. Place a second order (new incognito session)
2. On its confirmation page, click "בחר מתנה"
3. Fill the gift form with the **same phone number** used in F4.3
4. Submit
- [ ] Error: "כבר תבעת מתנה בעבר. ניתן לתבוע מתנה אחת בלבד."

---

---

## FLOW 5 — REFERRAL FLOW

### F5.1 — Referral link loads product page
1. Get your referral link from the welcome page or dashboard
2. Open the link (`/share/XXXXXX`) in a **new incognito window**
- [ ] Product page appears
- [ ] Yellow banner: "הגעת דרך המלצה – תקבל מתנה עם הרכישה!" visible

### F5.2 — Click is tracked
1. Check dashboard (Profile A, logged in) — "קליקים על הקישור" count
2. Go back to incognito window with the share link, reload the page
- [ ] Click count on dashboard increases each time

### F5.3 — Commission earned after purchase via referral link (Critical — tests K1 fix)
1. In the incognito window (from F5.1), complete a full purchase:
   - Click "קנה עכשיו", fill all fields, click "אשר הזמנה"
- [ ] Order confirmation shows green "הרכישה זוכתה לשגריר שלך 🎉" banner
2. Switch to Profile A (the referrer) → go to dashboard
- [ ] "רכישות דרך הקישור" count increased by 1
- [ ] "סה״כ נקודות שנצברו" increased by the commission amount
3. Go to `/wallet`
- [ ] New "הכנסה" (green badge) transaction in history with commission amount

### F5.4 — Referral buyer receives order confirmation SMS
1. Check the phone number entered in the order from F5.3
- [ ] SMS received with order confirmation details (K7 fix — this is now expected)

### F5.5 — Invalid referral code
1. Go to `/share/INVALIDCODE999`
- [ ] Page shows Next.js 404 (notFound) — no crash, no blank page

---

---

## FLOW 6 — DASHBOARD

> Must be logged in as a user who has completed the gift claim (Profile A)

### F6.1 — Dashboard loads
1. Go to `/dashboard`
- [ ] 4 stat cards: קליקים, רכישות, סה״כ נקודות, יתרה נוכחית
- [ ] All show correct numbers (non-negative)

### F6.2 — Referral link section
- [ ] Yellow card with your full referral URL
- [ ] "העתק" → copies link, shows "הועתק!" briefly
- [ ] "שתף בוואטסאפ" → opens WhatsApp
- [ ] "שתף בפייסבוק" → opens Facebook

### F6.3 — Withdrawal CTA (if balance ≥ 2,000)
- [ ] Green "הגעת לסף המשיכה! 🎉" card visible with "משוך עכשיו" button
- [ ] (If below 2,000: progress bar shown instead — no withdraw button)

### F6.4 — Progress bar (if balance < 2,000)
- [ ] Shows "עוד X נקודות ותוכל למשוך מזומן"
- [ ] Bar visually represents progress

### F6.5 — Recent commissions list
- [ ] If you have commissions (from F5.3): list shows dates + "X נקודות" badge each
- [ ] Up to 8 entries shown

### F6.6 — Activity chart
- [ ] If you have activity: line chart visible with clicks vs purchases
- [ ] If no activity: chart section is hidden entirely (no empty chart rendered)

### F6.7 — Guide link
- [ ] "מדריך לממליץ" button → navigates to `/guide`

### F6.8 — Dashboard for new user (no referrer record)
1. Log out, log in with a fresh email (no gift claim done)
2. Go to `/dashboard`
- [ ] Redirected directly to `/` (homepage) — no double-bounce through `/gift`

---

---

## FLOW 7 — WALLET

### F7.1 — Wallet loads
1. Go to `/wallet` as a logged-in referrer (Profile A)
- [ ] Dark card with points balance in large yellow text
- [ ] Progress bar toward 2,000

### F7.2 — Transaction history
- [ ] List of transactions with correct badge colors:
  - הכנסה → **green** badge
  - מימוש → **orange** badge
  - משיכה → **red** badge
- [ ] Each shows description, date, +/- amount

### F7.3 — Wallet for non-referrer user
1. Log in as a user who has NEVER done the gift claim
2. Go to `/wallet`
- [ ] Redirected directly to `/` (homepage) — no bounce through `/gift`

### F7.4 — Withdrawal request (requires ≥ 2,000 points)
1. Click "משוך לחשבון הבנק" button (only visible at ≥ 2,000)
- [ ] Dialog opens with: available balance, amount input, bank code, branch, account

**Validation tests:**
2. Enter amount below 2,000 → try submitting
   - [ ] Validation error — does not submit
3. Enter bank code "abc" (letters)
   - [ ] Server returns validation error (400)
4. Leave fields empty → submit
   - [ ] Required field validation fires

**Valid submission:**
5. Enter: amount ≥ 2,000, bank code (2–3 digits), branch (3–6 digits), account (4+ digits)
6. Click "שלח בקשת משיכה"
- [ ] Button shows "שולח בקשה..." spinner, disabled
- [ ] Toast: "בקשת המשיכה נשלחה! תקבל עדכון תוך 3-5 ימי עסקים."
- [ ] Dialog closes
- [ ] Page refreshes — new "ממתין לאישור" entry appears
- [ ] Balance reduced by requested amount

---

---

## FLOW 8 — SHOPPING CART

### F8.1 — Add to cart
1. On homepage, click "הוסף לעגלה"
- [ ] Toast "נוסף לעגלה!" appears with product name
- [ ] Cart badge shows "1"
2. Click "הוסף לעגלה" again
- [ ] Badge shows "2"

### F8.2 — Cart page
1. Go to `/cart`
- [ ] Item listed with image, name, price
- [ ] Quantity shows 2 (from F8.1)
- [ ] Total = price × 2
- [ ] +/- buttons and trash icon visible

### F8.3 — Quantity controls
1. Click "+" → quantity becomes 3, total updates
2. Click "–" twice → quantity becomes 1
3. Click "–" again → item removed, "העגלה ריקה" shown

### F8.4 — Cart persists after refresh
1. Add an item to cart
2. Refresh the page (F5)
- [ ] Cart item still there — not cleared

### F8.5 — Cart checkout
1. Have 1 item in cart, go to `/cart`
2. Click "להמשך לתשלום"
- [ ] Dialog opens with 4 fields only (no points slider)
3. Fill all fields and click "אשר הזמנה"
- [ ] Button shows "שולח..." spinner
- [ ] Redirected to order confirmation page

### F8.6 — Cart checkout with quantity > 1 (tests N5 fix)
1. Add a product, increase quantity to 3
2. Checkout with all fields filled
- [ ] Redirected to order confirmation for 1 of the 3 orders
- [ ] Note: 3 separate orders were created (one per unit) — check admin orders to verify

### F8.7 — Cart hover preview
1. Add an item to cart (from homepage)
2. Hover over the cart icon in the header
- [ ] Mini-preview shows item name, quantity × price, total
- [ ] "לעגלה" link navigates to `/cart`

---

---

## FLOW 9 — ORDER TRACKING

### F9.1 — Track page loads
1. Go to `/track`
- [ ] Form with "מספר הזמנה" and "טלפון או מייל" fields

### F9.2 — Track with valid order
1. Use the order ID from F3.3 + the email/phone used for that order
2. Submit
- [ ] Order details shown: order number, product name, date
- [ ] Status timeline visible — current stage highlighted in yellow

### F9.3 — Track by phone
1. Same order ID + the phone number from that order
- [ ] Same result as F9.2

### F9.4 — Wrong contact info
1. Valid order ID + wrong email
- [ ] "לא נמצאה הזמנה עם הפרטים שהוזנו" error — no data shown

### F9.5 — Fake order ID
1. Type "FAKEID123" + any email → submit
- [ ] Error message shown — no crash, no raw API error

---

---

## FLOW 10 — ORDER HISTORY

### F10.1 — Order history list
1. Log in (Profile A) → go to `/orders`
- [ ] List of past orders with: product image, name, date, amount, status badge

### F10.2 — Click order → detail page (tests N9 fix)
1. Click on an order card
- [ ] Navigates to `/orders/[order-id]` — order detail page loads

### F10.3 — Empty state
1. Log in as a fresh account with no orders → go to `/orders`
- [ ] "אין הזמנות עדיין" shown — no errors

---

---

## FLOW 11 — ORDER CONFIRMATION — SECURITY (tests N3 fix)

### F11.1 — Cannot view another user's order
1. Take an order ID that belongs to Profile A
2. Log in as Profile B (a different user) → go to `/orders/[that-order-id]`
- [ ] Shows "ההזמנה לא נמצאה" — not shown the other user's data

### F11.2 — Anonymous access blocked
1. Log out entirely
2. Go to `/orders/[any-valid-order-id]`
- [ ] Shows "ההזמנה לא נמצאה" — PII not exposed to anonymous visitors

---

---

## FLOW 12 — PROFILE SETTINGS

### F12.1 — Profile page
1. Log in → go to `/profile`
- [ ] Form shows saved values (or blank for new accounts)
- [ ] Loading spinner shown briefly while data fetches

### F12.2 — Save profile
1. Change "שם מלא" to something new
2. Click "שמור שינויים"
- [ ] Toast "הפרופיל עודכן בהצלחה!"
3. Refresh the page
- [ ] Name field shows the new value

---

---

## FLOW 13 — CHAT WIDGET

### F13.1 — Chat opens
1. Click the yellow circle button (bottom-left)
- [ ] Chat window opens with "שלום! איך אפשר לעזור? 😊"

### F13.2 — Send a question
1. Type "מה שעות המשלוח?" → press Enter
- [ ] AI responds in Hebrew within ~5 seconds
- [ ] "..." thinking indicator visible while waiting

### F13.3 — Manual escalation
1. Click "דבר/י עם נציג אנושי" link at the bottom
- [ ] Escalation form appears with 3 fields + optional email field

### F13.4 — Escalation form validation
1. Enter name with 1 character → "שלח"
   - [ ] Validation error on name
2. Enter valid name + invalid phone "123" → "שלח"
   - [ ] "מספר טלפון לא תקין"
3. Enter valid name + valid phone + summary shorter than 5 chars → "שלח"
   - [ ] Validation error on summary

### F13.5 — Valid escalation submission
1. Fill: שם מלא (2+ chars), טלפון (050-XXXXXXX), email (optional), "במה אפשר לעזור?" (5+ chars)
2. Click "שלח"
- [ ] Button shows spinner, disabled
- [ ] Success screen: "פרטיך התקבלו!" + ticket ID (8-char code)
- [ ] WhatsApp button or "נציג יחזור אליך בהקדם" shown

### F13.6 — Double-submit prevention (tests K5 fix)
1. Fill the escalation form again with the **same phone number** (within 5 minutes)
2. Submit
- [ ] Returns a success screen with the **same ticket ID** — no new duplicate created

### F13.7 — Admin receives email + SMS
1. Check the admin email inbox
- [ ] Email from PALI with buyer name, phone, email, issue summary, last chat messages, link to `/admin/support`
2. Check the admin phone
- [ ] SMS received: "[name] ([phone]): [first 80 chars of issue]"

### F13.8 — Chat closes and reopens
1. Click X to close the chat
- [ ] Chat window closes, yellow bubble remains
2. Click the bubble again
- [ ] Previous messages still visible — history not cleared

---

---

## FLOW 14 — FAQ / GUIDE / TERMS PAGES

### F14.1 — FAQ
1. Go to `/faq`
- [ ] Page loads with accordion sections (משלוחים, החזרות, תוכנית ממליצים)
- [ ] Click a question → answer expands
- [ ] Click again → collapses

### F14.2 — Guide
1. Go to `/guide`
- [ ] Tips grid visible
- [ ] 4 message templates visible (וואטסאפ, אינסטגרם, פייסבוק, מייל)
- [ ] Click copy button on a template → paste to verify text copied

### F14.3 — Terms
1. Go to `/terms`
- [ ] Page loads with terms sections — no crash

---

---

## FLOW 15 — ADMIN PANEL

> Use Profile B (admin account) for all tests below

### F15.1 — Admin dashboard
1. Log in as admin → go to `/admin`
- [ ] 5 stat cards: מוצרים, ממליצים פעילים, משיכות ממתינות, תביעות מתנות, פניות שירות

### F15.2 — Stat card navigation
1. Click each card:
   - "מוצרים" → scrolls to `#products` section on the same page
   - "ממליצים פעילים" → navigates to `/admin/referrers`
   - "משיכות ממתינות" → navigates to `/admin/withdrawals`
   - "תביעות מתנות" → scrolls to `#gifts` section on the same page ✓
   - "פניות שירות" → navigates to `/admin/support`

### F15.3 — Gift claims table (tests N4 fix)
1. On `/admin`, scroll down past the products table
- [ ] "תביעות מתנות" section is visible with a table
- [ ] Shows: name, email, phone, gift name, address, date for each claim

### F15.4 — Products management
1. On `/admin`, in the products table:
   - [ ] All products listed with name, price, visibility toggle, edit/delete
2. Click edit on a product → change description → save
   - [ ] Toast confirmation, table updates
3. Toggle visibility of a product → go to homepage in another tab
   - [ ] Product disappears / reappears accordingly

### F15.5 — Orders page
1. Go to `/admin/orders`
- [ ] Table with: מזהה, שם רוכש, אימייל, מוצר, סכום, נקודות, תשלום, **סטטוס משלוח (single column)**, תאריך, מס׳ מעקב
- [ ] NO duplicate shipping status columns (tests K3 fix)
2. Change shipping status of an order to "נשלחה" (and ensure tracking number is set)
   - [ ] Toast "סטטוס משלוח עודכן"
   - [ ] If tracking number present: buyer receives SMS (K7 fix)
3. Add a tracking number to an order (type → blur or Enter)
   - [ ] Toast "מספר מעקב עודכן"

### F15.6 — Referrers page
1. Go to `/admin/referrers`
- [ ] Table of referrers with: referral code, clicks, purchases, total earned, join date

### F15.7 — Withdrawals page
1. Go to `/admin/withdrawals`
- [ ] Table of withdrawal requests with bank details and status

**If you have a pending withdrawal (from F7.4):**

2. As **superadmin**: click ✓ approve on a pending request
   - [ ] Toast "הבקשה אושרה", status changes to "אושר"

3. As **superadmin**: click ✗ reject on a pending request
   - [ ] `window.prompt` appears asking for rejection reason (tests K4 fix)
   - [ ] Enter a reason (or leave blank) and click OK
   - [ ] Toast "הבקשה נדחתה", status changes to "נדחה"
   - [ ] Go to the referrer's `/wallet` → balance restored + new "הכנסה" transaction

4. As **regular admin** (not superadmin): approve/reject buttons are NOT visible

### F15.8 — Support tickets page
1. Go to `/admin/support`
- [ ] Table with all tickets (from F13.5 escalation)
2. Click "פתוחות" tab → only open tickets shown
3. Click "טופלו" tab → only handled tickets
4. Click "הכל" tab → all tickets
5. Find an open ticket → click "סמן כטופל"
   - [ ] Status changes to "טופלה", handled timestamp shown

---

---

## FLOW 16 — EDGE CASES

### F16.1 — Double-click order submit
1. Open "קנה עכשיו" dialog, fill all fields
2. Click "אשר הזמנה" twice very fast
- [ ] Only ONE order created — button disabled immediately after first click

### F16.2 — XSS in search
1. In the search bar, type: `<script>alert(1)</script>` → Enter
- [ ] Rendered as plain text in results — NO alert box appears

### F16.3 — Very long input
1. In the order form, paste 500 characters in the name field → submit
- [ ] Either validation error or graceful truncation — NOT a crash or 500 error

---

---

## FLOW 17 — MOBILE (DevTools Emulation)

> Open DevTools (F12) → device toolbar → iPhone (375px width)

### F17.1 — Homepage on mobile
- [ ] Layout fits without horizontal scroll
- [ ] Buttons are reachable and tappable
- [ ] Text readable

### F17.2 — Order dialog on mobile
1. Tap "קנה עכשיו"
- [ ] Dialog opens and is usable — fields visible, keyboard doesn't obscure buttons

### F17.3 — Cart on mobile
1. Add item, go to `/cart`
- [ ] No overflow, buttons usable, total visible

### F17.4 — Dashboard on mobile
1. Go to `/dashboard`
- [ ] Stat cards stack to 2 columns, chart scrollable/visible

### F17.5 — Admin on mobile
1. Go to `/admin`
- [ ] Tables scroll horizontally or content accessible

### F17.6 — Chat widget on mobile
1. Tap the chat bubble
- [ ] Chat window opens, input accessible, doesn't overflow screen

---

---

## QUICK SMOKE TEST (15 minutes — minimum viable run)

If short on time, run only these:

| # | Test | Pass? |
|---|------|-------|
| S1 | Homepage loads with product | |
| S2 | Click "קנה עכשיו" → fill form → submit → lands on `/orders/[id]` | |
| S3 | Click "בחר מתנה" → select gift → fill form → lands on `/welcome` | |
| S4 | Referral link `/share/CODE` shows product with yellow banner | |
| S5 | Buy via referral link → referrer's dashboard shows +1 purchase and points earned | |
| S6 | Go to `/dashboard` → 4 stats, referral link, copy button works | |
| S7 | Go to `/wallet` → balance shown, transaction history correct colors | |
| S8 | Go to `/admin` → 5 cards load, "תביעות מתנות" card scrolls to gift claims table | |
| S9 | Admin orders — single shipping status dropdown per row | |
| S10 | Chat widget opens, AI responds, escalation form submits successfully | |

---

---

## BUG REPORT TEMPLATE

When you find something, note it here:

| # | Flow | Step | Expected | Actual | Severity |
|---|------|------|----------|--------|----------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

**Severity:** Critical / High / Medium / Low

---

*PALI — Manual Test Script — 2026-04-29*
