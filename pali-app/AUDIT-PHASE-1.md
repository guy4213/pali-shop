# PALI — Manual Testing Guide — Phase 1
**Date:** 2026-04-28
**App URL:** http://localhost:3001
**Purpose:** Pre-production QA — full manual coverage of every testable feature before launch

---

## HOW TO USE THIS DOCUMENT
- Go through each section in order
- Mark each test: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- For failures — write exactly what happened vs. what was expected
- Tests marked **⚠️ KNOWN BUG** are already identified issues — confirm and document them
- Tests marked **🔒 SECURITY** are access/authorization checks — pay close attention

---

## SETUP BEFORE TESTING

1. Open the app at http://localhost:3001
2. You need **two browser profiles** (or one normal + one incognito):
   - Profile A = regular buyer / referrer
   - Profile B = admin account
3. Have **two different email addresses** ready (e.g. Gmail + alias)
4. Keep browser console open (F12 → Console) — note any red errors
5. Have a phone number handy for form fields

---

---

# SECTION 1 — HOMEPAGE & HEADER

## Test 1.1 — Homepage loads
**Steps:**
1. Go to http://localhost:3001

**Expected:** A product page appears with name, price, "קנה עכשיו" button, and trust badges
**Red flags:** Blank page, error, spinner that never stops

---

## Test 1.2 — Homepage when no visible products exist
**Steps:**
1. Admin: hide all products
2. Go to http://localhost:3001

**Expected:** "החנות בבנייה" or a graceful empty state — no crash, no raw error
**Then:** Restore product visibility before continuing

---

## Test 1.3 — Header top bar links
**Steps:**
1. Look at the dark bar at the very top

**Expected:**
- "איפה החבילה שלי?" → goes to `/track`
- "שאלות ותשובות" → goes to `/faq`
- Both links are clickable and navigate correctly

---

## Test 1.4 — Header search bar
**Steps:**
1. Click the search input in the header
2. Type a product keyword (e.g. "ספר")
3. Press Enter

**Expected:** Navigates to `/search?q=ספר` and shows results (or "לא נמצאו מוצרים")
**Red flag:** Nothing happens when pressing Enter

---

## Test 1.5 — Header cart icon — empty state
**Steps:**
1. Ensure cart is empty
2. Hover or click the cart icon (top right)

**Expected:** Dropdown or tooltip shows "העגלה ריקה"

---

## Test 1.6 — Header cart icon — with items
**Steps:**
1. Add a product to cart
2. Hover/click cart icon again

**Expected:**
- Badge shows item count
- Preview shows item name and price
- "לעגלה" link navigates to `/cart`

---

## Test 1.7 — Header — not logged in state
**Steps:**
1. Make sure you are NOT logged in
2. Look at the top-right of the header

**Expected:** "כניסה" button is visible
**Click it** → goes to `/auth/login`

---

## Test 1.8 — Header — logged in state
**Steps:**
1. Log in as a user
2. Look at "האזור שלי" in the header and click it

**Expected:** Dropdown opens with:
- User email
- Current points balance
- Links: הדשבורד שלי, היסטוריית הזמנות, הארנק שלי, הגדרות חשבון
- "התנתק" button

---

## Test 1.9 — Footer links
**Steps:**
1. Scroll to the bottom of any page
2. Check all footer links

**Expected:**
- Terms/privacy link → goes to `/terms`
- Copyright text present
- Links are clickable, no 404 errors

---

---

# SECTION 2 — AUTHENTICATION

## Test 2.1 — Login page loads
**Steps:**
1. Go to http://localhost:3001/auth/login

**Expected:** Page shows email input and "שלחו לי קישור כניסה" button

---

## Test 2.2 — Send magic link (valid email)
**Steps:**
1. Enter a valid email address
2. Click "שלחו לי קישור כניסה"

**Expected:** Confirmation message appears ("הקישור נשלח לאימייל שלך" or similar)
**Red flag:** Spinner that never stops, or error

---

## Test 2.3 — Click magic link → logged in
**Steps:**
1. Open the email
2. Click the magic link

**Expected:** Redirected to the app and logged in (profile menu shows your email)

---

## Test 2.4 — Login redirects back after protected page
**Steps:**
1. Log out
2. Go directly to `/dashboard`
3. You're redirected to login — log in

**Expected:** After login, you are sent back to `/dashboard` (not just homepage)

---

## Test 2.5 — Expired / already-used magic link
**Steps:**
1. Request a magic link
2. Click it once (log in)
3. Log out
4. Click the same magic link again

**Expected:** Error page or message saying the link is invalid/expired — does NOT log you in again

---

## Test 2.6 — Logout
**Steps:**
1. While logged in, click "האזור שלי" → "התנתק"

**Expected:** Logged out, "כניסה" button appears, redirected to homepage

---

## Test 2.7 — Protected pages redirect when not logged in
**Steps:**
1. Log out
2. Try accessing each of these directly: `/dashboard`, `/wallet`, `/profile`, `/orders`

**Expected:** Each redirects to `/auth/login`

---

## Test 2.8 — 🔒 Admin pages blocked for regular users
**Steps:**
1. Log in as a regular (non-admin) user
2. Try going to `/admin`

**Expected:** Redirected to login or shown "אין גישה" / 403 — NOT shown admin content

---

---

# SECTION 3 — PRODUCT PAGE & BUY NOW

## Test 3.1 — Product page displays correctly
**Steps:**
1. Go to homepage

**Expected:**
- Product image (or placeholder)
- Product name and description
- Star rating + review count
- ₪ price
- "קנה עכשיו" yellow button
- "הוסף לעגלה" outline button
- Trust badges: תשלום מאובטח, משלוח מהיר, אלפי לקוחות מרוצים

---

## Test 3.2 — "קנה עכשיו" opens order dialog
**Steps:**
1. Click "קנה עכשיו"

**Expected:** Dialog opens with:
- Product name + price summary
- Fields: שם מלא, אימייל, טלפון, כתובת למשלוח
- "אשר הזמנה – ₪XX" button
- Dialog can be closed (X or click outside)

---

## Test 3.3 — Complete an order (not logged in)
**Steps:**
1. Click "קנה עכשיו"
2. Fill all fields with valid data
3. Click "אשר הזמנה"

**Expected:**
- Loading spinner briefly
- Redirected to `/orders/[order-id]`
- Order confirmation page: order ID, product name, amount, buyer name, email
- Yellow gift CTA box: "מגיעה לך מתנה חינם!" + "בחר מתנה" button
- Delivery note: "המוצר יישלח תוך 3–5 ימי עסקים"

---

## Test 3.4 — Order requires all fields
**Steps:**
1. Click "קנה עכשיו"
2. Leave all fields empty → click "אשר הזמנה"
3. Try with only some fields filled

**Expected:** Form validation prevents submission, required fields highlighted

---

## Test 3.5 — Points redemption slider (logged-in user with balance)
**Steps:**
1. Log in as a user who has wallet points (≥ 1 point)
2. Click "קנה עכשיו"

**Expected:**
- Points slider / input appears in the order dialog
- Shows available balance
- Can slide/enter 0 to available balance (capped at product price)
- "אשר הזמנה" button shows discounted price, e.g. "אשר הזמנה – ₪XX (נחסכו ₪YY)"

---

## Test 3.6 — Points redemption — order completes and balance decreases
**Steps:**
1. Complete an order with X points applied
2. Go to `/wallet`

**Expected:**
- Balance decreased by X
- New transaction of type "מימוש" (redeem) appears in history with correct amount

---

## Test 3.7 — Points redemption — cannot exceed product price or balance
**Steps:**
1. Try setting points above the product price
2. Try setting points above your balance

**Expected:** Capped automatically at the lower of the two limits

---

## Test 3.8 — Add to cart button
**Steps:**
1. Click "הוסף לעגלה" on the product page

**Expected:** Toast "נוסף לעגלה!" appears, cart badge count increases by 1

---

## Test 3.9 — Product with no image shows placeholder
**Steps:**
1. Admin: edit a product and clear / leave blank the image URL
2. Go to the homepage

**Expected:** A circular gradient badge with a large "P" letter appears instead of an image — no broken image icon, no crash

---

---

# SECTION 4 — SHOPPING CART

## Test 4.1 — Cart page shows items
**Steps:**
1. Add one or more items to cart
2. Go to `/cart`

**Expected:**
- List of items with image, name, price
- Quantity +/- buttons
- Delete (trash) button per item
- Total price at bottom
- "להמשך לתשלום" button

---

## Test 4.2 — Increase quantity
**Steps:**
1. On `/cart`, click "+" on an item

**Expected:** Quantity increases by 1, total price updates accordingly

---

## Test 4.3 — Decrease quantity to 1
**Steps:**
1. Click "-" when quantity is 2

**Expected:** Quantity decreases to 1, total updates

---

## Test 4.4 — Decrease quantity below 1 (remove item)
**Steps:**
1. Click "-" when quantity is already 1

**Expected:** Item is removed from cart, total updates

---

## Test 4.5 — Delete button removes item
**Steps:**
1. Click the trash icon on a cart item

**Expected:** Item removed immediately, total recalculated

---

## Test 4.6 — Empty cart state
**Steps:**
1. Remove all items (or go to `/cart` with nothing added)

**Expected:** "העגלה ריקה" message and a link back to the store

---

## Test 4.7 — Cart persists after page refresh
**Steps:**
1. Add items to cart
2. Refresh the page

**Expected:** Cart items are still there (saved in localStorage)

---

## Test 4.8 — Cart checkout flow — single item
**Steps:**
1. Have 1 item in cart
2. Click "להמשך לתשלום"
3. Fill in the form
4. Click "אשר הזמנה"

**Expected:** Order created, redirected to order confirmation page

---

## Test 4.9 — ⚠️ Cart checkout has NO points redemption slider
**Steps:**
1. Log in as a user WITH points (e.g. 500 points)
2. Add a product to cart
3. Click "להמשך לתשלום"
4. Inspect the checkout dialog

**Expected (by design):** The dialog shows ONLY name, email, phone, address — there is NO points slider in cart checkout
**Note:** Points redemption is ONLY available via the "קנה עכשיו" button on the product page, not via the cart
**→ Document this behavior — is this intentional or a missing feature?**

---

## Test 4.10 — Cart checkout flow — multiple items
**Steps:**
1. Add 2 or more items to cart
2. Click "להמשך לתשלום"
3. Fill in the form and confirm

**Expected:** Multiple orders created (one per item), redirected to one of the confirmation pages

---

---

# SECTION 5 — REFERRAL FLOW

## Test 5.1 — Referral link loads product page
**Steps:**
1. Get a referral code (from dashboard or welcome page)
2. Open the URL `/share/[code]` in incognito

**Expected:**
- Product page appears
- Yellow banner: "הגעת דרך המלצה – תקבל מתנה עם הרכישה!"

---

## Test 5.2 — Referral click is tracked
**Steps:**
1. Visit `/share/[code]` in incognito
2. Log in to admin or check dashboard as the referrer

**Expected:** "קליקים על הקישור" count increased by 1

---

## Test 5.3 — Multiple visits from same code increment clicks
**Steps:**
1. Visit `/share/[code]` multiple times (each in a new incognito session or tab)
2. Check dashboard clicks count

**Expected:** Count increases for each unique visit

---

## Test 5.4 — ⚠️ KNOWN BUG — Referrer earns 0 points after a purchase via their link
**Steps:**
1. Visit `/share/[referral_code]` in incognito
2. Complete a purchase (fill form → confirm)
3. Log in as the referrer
4. Check dashboard: "רכישות דרך הקישור" and "סה"כ נקודות שנצברו"

**Expected (per spec):** Referrer earns points (commission_amount from product), count of purchases increases
**ACTUAL (known bug):** 0 points earned, 0 purchases shown
**→ Confirm this is still broken. Note exact numbers shown.**

---

## Test 5.5 — Referral attribution on order confirmation
**Steps:**
1. After buying via a referral link, look at the order confirmation page

**Expected:** Green banner "הרכישה זוכתה לשגריר שלך 🎉" is visible

---

## Test 5.6 — Order confirmation without referral — no attribution banner
**Steps:**
1. Complete a purchase directly (NOT via `/share/[code]`)
2. View order confirmation

**Expected:** Green attribution banner does NOT appear

---

## Test 5.7 — Invalid referral code
**Steps:**
1. Go to `/share/INVALIDCODE123`

**Expected:** Page loads (shows product without referral banner), or graceful error — no crash

---

---

# SECTION 6 — GIFT CLAIM FLOW

## Test 6.1 — Gift CTA on order confirmation
**Steps:**
1. Complete a purchase
2. View the order confirmation page

**Expected:** Yellow gradient box "מגיעה לך מתנה חינם!" + "בחר מתנה" button visible

---

## Test 6.2 — Gift selection page
**Steps:**
1. Click "בחר מתנה"

**Expected:**
- Page `/gift?order=[order_id]` loads
- Gift items shown with images and names
- Items are selectable (border highlights when selected)
- Out-of-stock items show "אזל המלאי" badge and cannot be selected

---

## Test 6.3 — Gift claim form appears after selection
**Steps:**
1. Select a gift item

**Expected:** Form appears with: שם מלא, טלפון, אימייל, כתובת
All fields are required

---

## Test 6.4 — Complete gift claim → Welcome page
**Steps:**
1. Select a gift
2. Fill in the form
3. Click "שלחו לי את המתנה!"

**Expected:**
- Loading spinner
- Redirected to `/welcome?code=...&url=...`
- Welcome page shows: "ברכותינו! 🎉"
- Personal referral link in a box
- "העתק" button (copies link, briefly shows "הועתק!")
- "שתף בוואטסאפ" (green) and "שתף בפייסבוק" (blue) buttons
- 3-step "כך זה עובד" explanation
- "לדשבורד שלי" button

---

## Test 6.5 — Welcome email received
**Steps:**
1. After completing gift claim (Test 6.4)
2. Check the email address you provided

**Expected:** Welcome email from PALI containing the personal referral link
*(may take 1–2 minutes)*

---

## Test 6.6 — Copy referral link on welcome page
**Steps:**
1. On welcome page, click "העתק"

**Expected:** Button briefly shows "הועתק!" and the link is now in clipboard
Paste somewhere to verify: link is `http://localhost:3001/share/[code]`

---

## Test 6.7 — Share on WhatsApp — welcome page
**Steps:**
1. Click "שתף בוואטסאפ"

**Expected:** Opens WhatsApp (web or app) with a pre-filled message containing the referral URL

---

## Test 6.8 — One gift per phone number (anti-abuse)
**Steps:**
1. Complete a gift claim with Phone A
2. Place a new order
3. Try to claim a gift again using the SAME phone number

**Expected:** Error: "כבר תבעת מתנה בעבר. ניתן לתבוע מתנה אחת בלבד."

---

## Test 6.9 — Gift CTA disappears after claiming
**Steps:**
1. After claiming a gift, go back to the same order's confirmation page

**Expected:** The "מגיעה לך מתנה" yellow box is gone — already claimed

---

## Test 6.10 — Gift page with already-claimed order
**Steps:**
1. Manually navigate to `/gift?order=[order-id-already-claimed]`

**Expected:** Error message or redirect — cannot claim twice on same order

---

## Test 6.11 — Gift page with no order param
**Steps:**
1. Go to `/gift` with NO query string at all (no `?order=`)

**Expected:** Redirected to homepage (`/`) immediately — no crash, no blank page

---

## Test 6.12 — Gift page with invalid/unpaid order ID
**Steps:**
1. Go to `/gift?order=FAKEID`

**Expected:** Error message "הזמנה לא תקפה" — does not show gift items, cannot proceed

---

## Test 6.13 — Loading state during gift claim submission
**Steps:**
1. Select a gift and fill in the form
2. Click "שלחו לי את המתנה!"
3. Watch the screen during the request

**Expected:** Screen shows "מכין את המתנה שלך..." with a spinner — button is disabled, cannot re-submit

---

## Test 6.14 — Out-of-stock gift stock decrements
**Steps:**
1. Admin: set a gift item stock to 1
2. Two different people claim that gift simultaneously (use two browsers)

**Expected:** Only one claim succeeds, the other sees "אזל המלאי" — no overselling

---

---

# SECTION 7 — WELCOME PAGE

## Test 7.1 — Welcome page loads with valid params
**Steps:**
1. Navigate to `/welcome?code=TESTCODE&url=http://localhost:3001/share/TESTCODE`

**Expected:** Page loads correctly showing the referral link

---

## Test 7.2 — Welcome page with missing params
**Steps:**
1. Go to `/welcome` (no query params)

**Expected:** Page loads gracefully — either shows a fallback or prompts to go to dashboard — no crash

---

## Test 7.3 — "לדשבורד שלי" button
**Steps:**
1. On welcome page, click "לדשבורד שלי"

**Expected:** Navigates to `/dashboard`

---

---

# SECTION 8 — DASHBOARD

## Test 8.1 — Dashboard requires login
**Steps:**
1. Log out
2. Go to `/dashboard`

**Expected:** Redirected to `/auth/login`

---

## Test 8.2 — Dashboard stats cards (4 cards)
**Steps:**
1. Log in as a user with gift claim completed
2. Go to `/dashboard`

**Expected:** 4 stat cards:
- קליקים על הקישור (number)
- רכישות דרך הקישור (number)
- סה"כ נקודות שנצברו (number)
- יתרה נוכחית (number)

---

## Test 8.3 — Referral link section
**Steps:**
1. On dashboard, find the "הקישורית האישית שלי" yellow box

**Expected:**
- Full referral URL displayed
- "העתק" button — click copies to clipboard, shows "הועתק!" briefly
- "שתף בוואטסאפ" green button → opens WhatsApp with referral message
- "שתף בפייסבוק" blue button → opens Facebook sharer

---

## Test 8.4 — Recent commissions list
**Steps:**
1. As a referrer who has earned commissions (requires Test 5.4 to be fixed, or seed data)
2. Scroll down on dashboard

**Expected:** List of recent commissions showing: date, amount earned per referral (up to last 8 entries)

---

## Test 8.5 — Activity chart (with data)
**Steps:**
1. As a referrer with click history, scroll down on dashboard

**Expected:** Line chart showing clicks vs purchases over the last 14 days

---

## Test 8.6 — Activity chart (no data)
**Steps:**
1. As a brand new referrer with no activity

**Expected:** Chart section is hidden or shows empty state — no chart errors

---

## Test 8.7 — Withdrawal CTA at threshold
**Steps:**
1. As a user with ≥ 2,000 points balance

**Expected:** Green banner "הגעת לסף המשיכה! 🎉" with "משוך עכשיו" button visible

---

## Test 8.8 — No withdrawal CTA below threshold
**Steps:**
1. As a user with < 2,000 points

**Expected:** No "הגעת לסף" banner — only progress indicator toward 2,000

---

## Test 8.9 — Guide link
**Steps:**
1. Click "מדריך לממליץ" on the dashboard

**Expected:** Navigates to `/guide`

---

## Test 8.10 — Dashboard for user with no referrer record → redirected to gift page
**Steps:**
1. Log in as a user who has never completed the gift flow (no referrer record)
2. Go to `/dashboard`

**Expected:** Automatically redirected to `/gift` — the dashboard requires a referrer record to function
**Red flag:** Blank page, crash, or staying on dashboard with empty/broken data

---

---

# SECTION 9 — WALLET

## Test 9.1 — Wallet balance and progress bar
**Steps:**
1. Go to `/wallet`

**Expected:**
- Dark card with current points in large yellow text
- Progress bar showing progress toward 2,000
- "עוד X נקודות ותוכל למשוך מזומן" if below threshold

---

## Test 9.2 — Transaction history
**Steps:**
1. Scroll down on `/wallet`

**Expected:** List of up to 50 transactions, each showing:
- Type badge: הכנסה (green) / מימוש (orange) / משיכה (red)
- Description
- Date
- Amount with +/- sign

---

## Test 9.3 — No transaction history (empty state)
**Steps:**
1. Log in as a new user with no transactions

**Expected:** Empty state message, no errors, no empty table rows

---

## Test 9.4 — Withdrawal button only shows when eligible
**Steps:**
1. As user with < 2,000 points: check there is NO "משוך לחשבון הבנק" button
2. As user with ≥ 2,000 points: "משוך לחשבון הבנק" button IS visible

---

## Test 9.5 — Withdrawal dialog opens
**Steps:**
1. As user with ≥ 2,000 points
2. Click "משוך לחשבון הבנק"

**Expected:** Dialog opens with:
- Available balance shown
- Amount input (minimum 2,000)
- Bank code field
- Branch number field
- Account number field
- "שלח בקשת משיכה" button

---

## Test 9.6 — Submit valid withdrawal request
**Steps:**
1. Fill bank details (bank code 2–3 digits, branch 3–6 digits, account 5–9 digits)
2. Enter amount ≥ 2,000
3. Click "שלח בקשת משיכה"

**Expected:**
- Toast: "בקשת המשיכה נשלחה! תקבל עדכון תוך 3-5 ימי עסקים."
- Dialog closes
- Page refreshes
- New "בקשות משיכה" entry appears with status "ממתין לאישור"
- Points balance decreases by requested amount

---

## Test 9.7 — Pending withdrawal blocks that balance
**Steps:**
1. Submit a withdrawal for X points
2. Check balance shown — should be reduced by X even while "ממתין לאישור"

**Expected:** Balance reflects the pending deduction

---

## Test 9.8 — Withdrawal validation — amount too low
**Steps:**
1. Enter amount below 2,000

**Expected:** Validation error, form does not submit

---

## Test 9.9 — Withdrawal validation — empty bank fields
**Steps:**
1. Leave bank code / branch / account blank

**Expected:** Validation error, form does not submit

---

## Test 9.10 — Withdrawal validation — invalid bank format
**Steps:**
1. Enter bank code = "abc" (letters instead of digits)
2. Enter branch = "1" (too short)

**Expected:** Validation errors shown for each invalid field

---

## Test 9.11 — Wallet at exactly 0 balance
**Steps:**
1. Log in as a user with 0 points (brand new referrer, no commissions yet)
2. Go to `/wallet`

**Expected:**
- Balance shows "0" in large yellow text
- Progress bar is at 0% (empty)
- "עוד 2000 נקודות ותוכל למשוך מזומן" message
- NO withdrawal button shown
- No negative values, no errors

---

---

# SECTION 10 — ORDER TRACKING

## Test 10.1 — Track page form loads
**Steps:**
1. Go to http://localhost:3001/track
   *(also: click "איפה החבילה שלי?" in the header)*

**Expected:** Form with two fields: מספר הזמנה and טלפון/אימייל

---

## Test 10.2 — Track a valid order by email
**Steps:**
1. Use an order ID from a previous purchase + the email used for that order
2. Submit the form

**Expected:**
- Order details: order number, product name, order date
- Status timeline showing the current stage
  (received → processing → packed → shipped → in_transit → delivered)
- Tracking number shown if one was added by admin

---

## Test 10.3 — Track a valid order by phone
**Steps:**
1. Use the same order ID + the phone number from that order
2. Submit

**Expected:** Same result as Test 10.2

---

## Test 10.4 — Track with wrong contact info
**Steps:**
1. Enter a valid order ID but a wrong email/phone

**Expected:** "לא נמצאה הזמנה עם הפרטים שהוזנו" — no order data shown

---

## Test 10.5 — Track with fake order ID
**Steps:**
1. Enter "FAKEID123" as order number and any email

**Expected:** Error message — no crash, no raw API error exposed

---

## Test 10.6 — Status timeline shows correct current stage
**Steps:**
1. Admin: set an order's shipping_status to "shipped"
2. Track that order

**Expected:** Timeline highlights "נשלחה" stage as the current one

---

---

# SECTION 11 — PROFILE SETTINGS

## Test 11.1 — Profile page loads with saved data
**Steps:**
1. Log in
2. Go to `/profile`

**Expected:** Form shows current saved values for: שם מלא, טלפון, כתובת, bank code, branch, account
*(Fields may be blank for new users — that's fine)*

---

## Test 11.2 — Save profile changes persist
**Steps:**
1. Change full name field to something new
2. Click "שמור שינויים"
3. Refresh the page

**Expected:**
- Toast "הפרופיל עודכן בהצלחה!"
- After refresh, field shows the new value

---

## Test 11.3 — Loading state while fetching profile
**Steps:**
1. Go to `/profile` on a slow connection (DevTools → Network → Slow 3G)

**Expected:** Spinner or skeleton shown while data loads — no broken/empty layout

---

---

# SECTION 12 — ORDER HISTORY

## Test 12.1 — View order history
**Steps:**
1. Log in as a user who has placed orders
2. Go to `/orders`

**Expected:** List of past orders, each showing:
- Product image
- Product name
- Order amount
- Status badge (color-coded: pending, paid, shipped, delivered, cancelled)
- Order date
- Link to order detail

---

## Test 12.2 — Click order item → order detail
**Steps:**
1. Click on an order in the list

**Expected:** Goes to `/orders/[order_id]` with full order detail

---

## Test 12.3 — Empty order history
**Steps:**
1. Log in as a brand new user
2. Go to `/orders`

**Expected:** Empty state message — no error, no empty table

---

---

# SECTION 13 — ORDER CONFIRMATION PAGE (All States)

## Test 13.1 — Standard order confirmation
**Steps:**
1. Complete a purchase (no referral, not logged in)
2. View the confirmation page

**Expected:**
- Order ID shown
- Product name and amount
- Buyer name and email
- "המוצר יישלח תוך 3–5 ימי עסקים"
- Yellow gift CTA box visible
- No green referral attribution banner

---

## Test 13.2 — Order confirmation with referral attribution
**Steps:**
1. Buy via `/share/[code]`
2. View confirmation

**Expected:** Green "הרכישה זוכתה לשגריר שלך 🎉" banner AND gift CTA box

---

## Test 13.3 — Order confirmation after gift already claimed
**Steps:**
1. Complete a purchase
2. Claim the gift
3. Return to the same order's confirmation page

**Expected:** Gift CTA box is gone — cannot claim twice

---

## Test 13.4 — Order confirmation social sharing
**Steps:**
1. On the order confirmation page (post-gift)
2. Look for sharing buttons

**Expected:** WhatsApp / Facebook share buttons present (if applicable per spec)

---

## Test 13.5 — Order confirmation for non-existent order ID
**Steps:**
1. Go to `/orders/00000000-0000-0000-0000-000000000000`

**Expected:**
- Page shows a "not found" state in Hebrew: "ההזמנה לא נמצאה"
- Subtext: "ייתכן שהקישור שגוי או שההזמנה לא קיימת במערכת"
- Link back to homepage
- No crash, no raw error, no blank page

---

---

# SECTION 14 — CHAT & SUPPORT

## Test 14.1 — Chat widget opens
**Steps:**
1. Click the yellow circle chat button (bottom-left of any page)

**Expected:** Chat window opens with greeting "שלום! איך אפשר לעזור? 😊"

---

## Test 14.2 — Send a question and get AI response
**Steps:**
1. Type "מה שעות המשלוח?" and press Enter

**Expected:** AI responds in Hebrew within ~5 seconds

---

## Test 14.3 — AI escalation trigger
**Steps:**
1. Type something like "אני רוצה לדבר עם נציג אנושי" or "אני מאוד לא מרוצה"

**Expected:** AI response appears AND the escalation form shows up (or a "דבר עם נציג" prompt appears)

---

## Test 14.4 — Manual escalation link
**Steps:**
1. Look for "דבר/י עם נציג אנושי" link at the bottom of the chat

**Expected:** Link is visible and clickable, opens the escalation form

---

## Test 14.5 — Submit escalation form — valid
**Steps:**
1. Fill escalation form:
   - שם מלא: at least 2 characters
   - טלפון: valid Israeli number (e.g. 0501234567)
   - "במה אפשר לעזור?": at least 5 characters
2. Click "שלח"

**Expected:**
- Confirmation screen: "פרטיך התקבלו!"
- Ticket ID shown (8-char code)
- "נציג יחזור אליך בהקדם" or WhatsApp link

---

## Test 14.6 — Escalation form validation — invalid phone
**Steps:**
1. Enter phone "12345" (too short / invalid Israeli format)
2. Click "שלח"

**Expected:** Validation error "מספר טלפון לא תקין"

---

## Test 14.7 — Escalation form validation — short name
**Steps:**
1. Enter a 1-character name

**Expected:** Validation error on name field

---

## Test 14.8 — Escalation form validation — short issue text
**Steps:**
1. Enter issue summary with fewer than 5 characters

**Expected:** Validation error on summary field

---

## Test 14.9 — Admin receives escalation notification
**Steps:**
1. Complete a valid escalation (Test 14.5)
2. Check the admin email inbox (ADMIN_EMAIL from env)

**Expected:** Email with:
- Buyer name, phone, email
- Issue summary
- Last few chat messages as history

---

## Test 14.10 — Admin SMS notification for escalation
**Steps:**
1. Complete a valid escalation (Test 14.5)
2. Check the admin phone (ADMIN_PHONE from env)

**Expected:** SMS received with brief summary of the issue and buyer contact

---

## Test 14.11 — ⚠️ Escalation double-submit creates duplicate tickets
**Steps:**
1. Fill in the escalation form with valid details
2. Click "שלח" twice quickly (or open a second browser and submit the same details again)
3. Check `/admin/support`

**Expected (ideal):** Only one ticket created
**ACTUAL (known gap):** Two separate tickets are created — there is no deduplication
**→ Document: confirm this happens, note the two ticket IDs**

---

## Test 14.12 — Chat closes
**Steps:**
1. Click X button on the chat window

**Expected:** Chat window closes, yellow circle button returns

---

## Test 14.13 — Chat history persists within session
**Steps:**
1. Send a few messages
2. Close and re-open the chat widget

**Expected:** Previous messages are still visible (not cleared on close)

---

---

# SECTION 15 — FAQ, GUIDE & TERMS PAGES

## Test 15.1 — FAQ page loads
**Steps:**
1. Go to `/faq`

**Expected:** Page loads with questions and answers — no error, no blank page

---

## Test 15.2 — Guide page loads and shows templates
**Steps:**
1. Go to `/guide`

**Expected:**
- Tips section with referral tips
- Copy-paste message templates (WhatsApp, Instagram, Facebook, Email)
- Each template has a copy button

---

## Test 15.3 — Copy template button
**Steps:**
1. Click the copy button on a message template

**Expected:** Template text copied to clipboard (paste to verify)

---

## Test 15.4 — Terms page loads
**Steps:**
1. Go to `/terms`

**Expected:** Page loads with content — no error, no blank page

---

---

# SECTION 16 — SEARCH PAGE

## Test 16.1 — Search finds matching products
**Steps:**
1. Type a keyword matching a product name in the header search
2. Press Enter

**Expected:** `/search?q=...` page shows matching product cards

---

## Test 16.2 — Search with no results
**Steps:**
1. Search for "xyzxyz123abc" (nonsense)

**Expected:** "לא נמצאו מוצרים" empty state — no error

---

## Test 16.3 — Search with Hebrew characters
**Steps:**
1. Type Hebrew text in search (e.g. "ספר")

**Expected:** Search works correctly, results appear in Hebrew

---

## Test 16.4 — ⚠️ KNOWN BUG — Search result product links may be broken
**Steps:**
1. Search for a product that exists
2. Click on a product card in the results

**Expected:** Goes to the product page
**ACTUAL (known bug):** May navigate to `/share/undefined` or 404
**→ Document exactly where it navigates**

---

## Test 16.5 — Empty search (no query)
**Steps:**
1. Press Enter in the search bar without typing anything

**Expected:** Either nothing happens or shows "all products" — no crash

---

---

# SECTION 17 — ADMIN PANEL

*Use an admin account for all tests in this section*

## Test 17.1 — Admin page loads and shows stats
**Steps:**
1. Log in as admin
2. Go to `/admin`

**Expected:** Dashboard shows stat cards:
- מוצרים (total count)
- ממליצים פעילים
- משיכות ממתינות
- תביעות מתנות
- פניות שירות פתוחות

---

## Test 17.2 — Admin stat cards are clickable
**Steps:**
1. Click on each stat card

**Expected:** Each card navigates to the relevant management page

---

## Test 17.3 — Admin — View products table
**Steps:**
1. On `/admin`, look at the products table

**Expected:** Table showing all products with name, price, visibility toggle, edit/delete buttons

---

## Test 17.4 — Admin — Edit a product
**Steps:**
1. Click edit on a product
2. Change the price
3. Save

**Expected:** Product table updates immediately, toast confirmation

---

## Test 17.5 — Admin — Add new product
**Steps:**
1. Click "הוסף מוצר" or similar
2. Fill in: name, description, price, image URL, commission amount
3. Save

**Expected:** New product appears in the table

---

## Test 17.6 — Admin — Add product validation
**Steps:**
1. Try to add a product with required fields empty (name, price)

**Expected:** Validation errors — form does not submit

---

## Test 17.7 — Admin — Delete a product
**Steps:**
1. Create a test product
2. Delete it

**Expected:** Product removed from table, no longer appears on homepage or search

---

## Test 17.8 — Admin — Toggle product visibility
**Steps:**
1. Find a visible product, toggle it to "hidden"
2. Go to homepage in another tab

**Expected:** Product no longer shows on homepage / search
**Then toggle back** → product reappears

---

## Test 17.9 — Admin — Orders page loads
**Steps:**
1. Go to `/admin/orders`

**Expected:** Table with columns: buyer name, email, product, amount, payment status, shipping status, tracking number, date

---

## Test 17.10 — ⚠️ KNOWN BUG — Admin orders table has duplicate columns
**Steps:**
1. Go to `/admin/orders`
2. Look at the column headers

**Expected:** Each data field appears once
**ACTUAL (known bug):** "סטטוס משלוח" header appears twice, each order row has two shipping status dropdowns
**→ Confirm visible, note exact column layout**

---

## Test 17.11 — Admin — Update shipping status
**Steps:**
1. Find an order, change shipping status dropdown (e.g. "התקבלה" → "נשלחה")

**Expected:** Status saves, toast "סטטוס משלוח עודכן"

---

## Test 17.12 — Admin — Add tracking number
**Steps:**
1. Find an order, click the tracking number field
2. Type a tracking number
3. Press Enter or click elsewhere

**Expected:** Tracking number saved, toast "מספר מעקב עודכן"
**Then:** Buyer can see the tracking number on `/track`

---

## Test 17.13 — Admin — Referrers page
**Steps:**
1. Go to `/admin/referrers`

**Expected:** Table of active referrers with their codes — no crash

---

## Test 17.14 — Admin — Withdrawals page
**Steps:**
1. Go to `/admin/withdrawals`

**Expected:** Table of withdrawal requests: referrer, amount, bank details, date, status

---

## Test 17.15 — Admin — Approve withdrawal (superadmin)
**Steps:**
1. As superadmin, find a pending withdrawal
2. Click the green ✓ approve button

**Expected:** Status changes to "אושר", toast confirmation, balance stays reduced

---

## Test 17.16 — Admin — Reject withdrawal → points restored
**Steps:**
1. As superadmin, reject a pending withdrawal
2. Go to the referrer's wallet page

**Expected:**
- Withdrawal status shows "נדחה"
- Referrer's balance restored (new "הכנסה" transaction in wallet history)

---

## Test 17.16b — ⚠️ Admin rejection has no note/reason field
**Steps:**
1. As superadmin, click the reject button on a withdrawal
2. Look for a dialog asking for a rejection reason

**Expected (ideal):** A field to enter an admin note / rejection reason
**ACTUAL (known gap):** No dialog appears — rejection happens immediately with no note
**→ Document: the admin_note field exists in the database but is not surfaced in the UI — rejection reason cannot be communicated to the referrer**

---

## Test 17.17 — 🔒 Regular admin cannot approve/reject withdrawals
**Steps:**
1. Log in as a regular admin (not superadmin)
2. Go to `/admin/withdrawals`
3. Try to approve or reject a withdrawal

**Expected:** Action is blocked — approve/reject buttons either hidden or return an error

---

## Test 17.18 — Admin — Support tickets page
**Steps:**
1. Go to `/admin/support`

**Expected:** Table of support tickets with: ticket ID, date, buyer name, phone, email, issue summary, status (פתוח/טופל)

---

## Test 17.19 — Admin — Filter support tickets by status
**Steps:**
1. On `/admin/support`, click "פתוחות" tab
2. Click "טופלו" tab
3. Click "הכל" tab

**Expected:** Each tab filters the table correctly — no mixing of statuses

---

## Test 17.20 — Admin — Mark support ticket as handled
**Steps:**
1. Find an open ticket (פתוח)
2. Click "סמן כטופל"

**Expected:**
- Ticket status changes to "טופל"
- Handled date/time appears
- Ticket moves to "טופלו" tab if filtering

---

---

# SECTION 18 — MOBILE & RESPONSIVENESS

## Test 18.1 — Homepage on mobile (375px)
**Steps:**
1. Open DevTools → device toolbar → iPhone (375px)
2. Load homepage

**Expected:** Layout fits without horizontal scroll, buttons reachable, text readable

---

## Test 18.2 — Cart on mobile
**Steps:**
1. On mobile viewport, add item to cart, go to `/cart`

**Expected:** Functional on mobile — no overflow, buttons usable

---

## Test 18.3 — Dashboard on mobile
**Steps:**
1. On mobile viewport, go to `/dashboard`

**Expected:** Stat cards stack vertically, chart scrollable or stacked, no content cut off

---

## Test 18.4 — Gift page on mobile
**Steps:**
1. On mobile viewport, go through the gift claim flow

**Expected:** Gift items selectable, form usable, buttons visible

---

## Test 18.5 — Chat widget on mobile
**Steps:**
1. On mobile viewport, tap the chat bubble

**Expected:** Chat window usable on small screen, input accessible, no keyboard overlap issues

---

## Test 18.6 — Admin panel on mobile
**Steps:**
1. On mobile viewport, go to `/admin`

**Expected:** Tables scroll horizontally or stack — no content hidden, actions accessible

---

---

# SECTION 19 — RTL / HEBREW LAYOUT

## Test 19.1 — All pages are RTL
**Steps:**
1. Check each main page (home, dashboard, wallet, gift, admin)

**Expected:**
- Text is right-aligned throughout
- Layout flows right-to-left
- No mixed-direction breakage (e.g. left-aligned Hebrew text)

---

## Test 19.2 — Forms are RTL
**Steps:**
1. Open any form (order dialog, gift form, withdrawal dialog)

**Expected:** Labels on right, inputs aligned RTL, error messages on correct side

---

## Test 19.3 — Number formatting
**Steps:**
1. Look at all prices and point balances

**Expected:** ₪ sign appears correctly, numbers formatted logically (not reversed)

---

---

# SECTION 20 — SECURITY & ACCESS CONTROL

## Test 20.1 — 🔒 Viewing someone else's order
**Steps:**
1. Know a valid order ID (from an order you did NOT place)
2. Log in as a different user
3. Go to `/orders/[that-order-id]`

**Expected (ideal):** Access denied or page does not show the other user's data
**→ Document what actually happens — this may be an open access issue**

---

## Test 20.2 — 🔒 Direct access to gift page without valid order
**Steps:**
1. Go to `/gift?order=FAKEID`

**Expected:** Error message — does not show gift items or let you proceed

---

## Test 20.3 — 🔒 API endpoint — create order without product
**Steps:**
1. Use browser DevTools → console
2. Run: `fetch('/api/orders/create', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({product_id: '00000000-0000-0000-0000-000000000000', buyer_name:'Test', buyer_email:'t@t.com', buyer_phone:'0501234567', buyer_address:'Some Address 1'})})`

**Expected:** API returns a proper error (404 or 400) — not a 500 or crash

---

## Test 20.4 — 🔒 Wallet page for non-referrer user
**Steps:**
1. Log in as a user who has never claimed a gift (no referrer record)
2. Go to `/wallet`

**Expected:** Graceful empty state or redirect — not a crash or raw error

---

---

# SECTION 21 — EDGE CASES & STRESS

## Test 21.1 — Double-click order submit
**Steps:**
1. Open the order dialog
2. Fill in details
3. Double-click "אשר הזמנה" very fast

**Expected:** Only ONE order is created — not two duplicate orders

---

## Test 21.2 — Browser back after order confirmation
**Steps:**
1. Complete an order
2. On the confirmation page, press browser Back
3. Then Forward to return to confirmation page

**Expected:** No duplicate order created, page still shows correctly

---

## Test 21.3 — Very long input values
**Steps:**
1. In the order form, type 500 characters in the name field
2. Submit

**Expected:** Either truncated gracefully or validation error — not a database crash

---

## Test 21.4 — Special characters in search
**Steps:**
1. Search for `<script>alert(1)</script>`

**Expected:** Rendered as plain text in results — not executed as JavaScript (no alert)

---

## Test 21.5 — Cart with 10+ items
**Steps:**
1. Add the same product many times or add many products
2. Go to `/cart`

**Expected:** Cart loads correctly, total is correct, checkout works

---

## Test 21.6 — Out-of-stock gift during checkout
**Steps:**
1. Admin: set a gift item stock to 0
2. Go to `/gift?order=[valid-paid-order]`

**Expected:** That item shows "אזל המלאי" badge and cannot be selected

---

---

# SECTION 22 — NOTIFICATIONS (EMAIL & SMS)

> **Important context for the tester:** The app has notification functions defined in code. Some are active; some are defined but NOT yet connected to any trigger. This section tells you exactly what to expect.

## What IS currently sent:

| Notification | Trigger | Recipient | Expected |
|---|---|---|---|
| Welcome email | Gift claim completed | Claimant's email | Email with referral link |
| Escalation email | Support ticket submitted | Admin email | Email with buyer details + chat history |
| Escalation SMS | Support ticket submitted | Admin phone | SMS summary of issue |

## What is NOT sent (functions exist but are never triggered):

| Notification | Status | Notes |
|---|---|---|
| Order confirmation SMS to buyer | ❌ NOT IMPLEMENTED | Code exists but not called |
| Commission earned SMS to referrer | ❌ NOT IMPLEMENTED | Code exists but not called |
| Shipping update SMS to buyer | ❌ NOT IMPLEMENTED | Code exists but not called |
| Sale notification email to referrer | ❌ NOT IMPLEMENTED | Code exists but not called |

**→ If you receive any of the "NOT IMPLEMENTED" notifications during testing, that is UNEXPECTED — document it immediately.**

---

## Test 22.1 — Welcome email arrives after gift claim
**Steps:**
1. Complete the full gift claim flow (Section 6, Test 6.4)
2. Check the email inbox of the address you entered in the gift form

**Expected:** Email from PALI arrives within 1–2 minutes containing the personal referral link
**Red flag:** Email never arrives, or arrives with a broken/empty referral link

---

## Test 22.2 — Admin escalation email arrives
**Steps:**
1. Submit a support escalation from the chat widget (Section 14, Test 14.5)
2. Check the admin email inbox

**Expected:** Email with:
- Buyer name, phone, email, ticket ID
- Issue summary
- Last few chat messages
- Link to `/admin/support`

---

## Test 22.3 — Admin escalation SMS arrives
**Steps:**
1. Submit a support escalation (same as Test 22.2)
2. Check the admin phone

**Expected:** Short SMS: "[buyer name] ([phone]): [first 80 chars of issue]"
**Red flag:** SMS not received (check that VONAGE env vars are configured)

---

## Test 22.4 — No unexpected SMS to buyer after ordering
**Steps:**
1. Place an order
2. Check the phone number you entered in the order form

**Expected:** No SMS received (order confirmation SMS is not yet implemented)

---

## Test 22.5 — Phone number formats accepted in forms
**Steps:**
Test each of these phone formats in escalation / gift / order forms:
1. `0501234567` (standard Israeli)
2. `050-123-4567` (with dashes)
3. `+972501234567` (international)

**Expected:** All three formats are accepted and normalized — no validation error for any of them

---

---

# SECTION 23 — LOADING STATES & TOAST MESSAGES

## Test 23.1 — Order submit loading state
**Steps:**
1. Fill the "קנה עכשיו" dialog and click "אשר הזמנה"
2. Watch the button during the request

**Expected:** Button becomes disabled and shows a spinner with "שולח הזמנה..." — cannot be clicked again

---

## Test 23.2 — Cart checkout loading state
**Steps:**
1. Fill the cart checkout form and click "אשר הזמנה"
2. Watch the button

**Expected:** Button shows spinner with "שולח..." — disabled during request

---

## Test 23.3 — Withdrawal submit loading state
**Steps:**
1. Fill the withdrawal dialog and click "שלח בקשת משיכה"
2. Watch the button

**Expected:** Button shows spinner with "שולח בקשה..." — disabled during request

---

## Test 23.4 — Gift items loading state
**Steps:**
1. Go to `/gift?order=[valid-order-id]` on a slow connection (DevTools → Slow 3G)

**Expected:** A spinning loader icon appears while gift items are fetched — no blank page

---

## Test 23.5 — Gift claim loading screen
**Steps:**
1. Select a gift, fill in the form, and submit
2. Watch the screen during the API call

**Expected:** Full-screen loading state: "מכין את המתנה שלך..." with a large spinner — page does not flash or jump

---

## Test 23.6 — Toast: add to cart success
1. Click "הוסף לעגלה"
**Expected:** Green/default toast: "נוסף לעגלה!" with product name

---

## Test 23.7 — Toast: copy referral link success
1. Click "העתק" on dashboard or welcome page
**Expected:** Toast: "הקישור הועתק!"

---

## Test 23.8 — Toast: copy link failure (clipboard blocked)
1. In a browser that blocks clipboard access, click "העתק"
**Expected:** Error toast: "לא ניתן להעתיק. העתק ידנית." — the link is still visible to copy manually

---

## Test 23.9 — Toast: order submission error
1. Disconnect internet, then try to submit an order
**Expected:** Error toast: "שגיאה ביצירת ההזמנה" with the error detail

---

## Test 23.10 — Toast: withdrawal success
1. Submit a valid withdrawal request
**Expected:** Toast: "בקשת המשיכה נשלחה! תקבל עדכון תוך 3-5 ימי עסקים."

---

## Test 23.11 — Toast: gift out-of-stock error
1. Try to claim a gift item with stock = 0 (race condition or pre-set by admin)
**Expected:** Error toast: "המתנה שבחרת אזלה מהמלאי"

---

## Test 23.12 — Toast: admin withdrawal approved/rejected
1. Admin approves a withdrawal
**Expected:** Toast: "הבקשה אושרה"
2. Admin rejects a withdrawal
**Expected:** Toast: "הבקשה נדחתה"

---

---

# BUG LOG

When you find a bug, record it here:

| # | Page / Feature | Steps to Reproduce | Expected | Actual | Severity |
|---|---------------|-------------------|----------|--------|----------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

**Severity levels:**
- **Critical** — core flow broken (can't order, can't earn, can't login)
- **High** — important feature broken or wrong data
- **Medium** — partial or confusing behavior
- **Low** — cosmetic, typo, minor UX issue

---

# CONFIRMED KNOWN BUGS (Verify these still exist)

| # | ID | Description | Where to test |
|---|----|-------------|--------------|
| 1 | K1 | Referrer earns 0 points when someone buys via their link | Section 5 → Test 5.4 |
| 2 | K2 | Search result product cards link to broken URL (`/share/undefined` or 404) | Section 16 → Test 16.4 |
| 3 | K3 | Admin orders table has duplicate "סטטוס משלוח" columns | Section 17 → Test 17.10 |
| 4 | K4 | Admin rejection has no note/reason UI — admin_note field unused in UI | Section 17 → Test 17.16b |
| 5 | K5 | Support escalation double-submit creates duplicate tickets | Section 14 → Test 14.11 |
| 6 | K6 | Cart checkout has no points redemption slider (only Buy Now does) | Section 4 → Test 4.9 |
| 7 | K7 | 4 notification functions defined in code but never triggered (order SMS, commission SMS, shipping SMS, sale email) | Section 22 → Tests 22.4 |

---

*PALI — Manual Testing Guide Phase 1 — Pre-production QA — 2026-04-28*
