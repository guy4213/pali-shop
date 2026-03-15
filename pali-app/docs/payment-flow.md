# PALI — Payment Flow Specification

> Status: Draft — awaiting selection of payment provider and confirmation of refund policy.

---

## 1. Payment Provider Options (Israel)

| Provider | Supports Installments (תשלומים) | Notes |
|---|---|---|
| **PayPlus** | Yes | Israeli-native, easy integration, supports Bit |
| **Meshulam** | Yes | Popular with Israeli SMBs |
| **Cardcom** | Yes | Established Israeli acquirer |
| **Stripe** | No (ILS only, no installments) | Good dev experience, no local installments |

**Recommendation:** PayPlus or Meshulam for Israeli market. Installments are expected by Israeli shoppers.

---

## 2. Purchase Flow (Happy Path)

```
Buyer lands on /share/[code]  (referral link)
        ↓
Referral click is tracked → referral_clicks INSERT
Referral code stored in cookie (30-day window)
        ↓
Buyer views product page (/)
        ↓
Buyer clicks "Buy" → /cart or direct checkout
        ↓
Buyer fills: name, email, phone, address
        ↓
"Pay" button → API route: POST /api/orders/create
  - Creates order (status='pending', payment_status='unpaid')
  - Returns order_id + payment gateway URL
        ↓
Buyer redirected to payment gateway (PayPlus/Meshulam hosted page)
        ↓
Payment gateway POSTs webhook to: POST /api/payments/webhook
  - Verifies webhook signature
  - Sets order.payment_status = 'paid', order.payment_reference = txn_id
  - Sets order.status = 'paid'
  - Reads referral_code from order
  - Inserts commission row for referrer (points = product.commission_amount)
  - Inserts wallet_transaction (type='earn') for referrer
  - Sends notification email/SMS to referrer ("מזל טוב! צברת X נקודות")
        ↓
Buyer redirected to /orders/[order_id] — confirmation page
```

---

## 3. Refund / Cancellation Policy

**Decision required:** What happens to referrer points when an order is refunded?

**Option A — Points are clawed back:**
- On refund webhook: insert wallet_transaction (type='redeem', negative amount)
- If referrer balance goes negative, flag for review
- Most fair to the business

**Option B — Points are kept (no claw-back):**
- Simpler, but opens abuse (buy → earn points → refund → repeat)
- Not recommended

**Recommended:** Option A with a 30-day refund window. After 30 days, points are confirmed and cannot be clawed back.

---

## 4. Webhook Security

The payment gateway will POST to `/api/payments/webhook`.

```typescript
// Required validation — never process unsigned webhooks
const signature = request.headers.get('x-payplus-signature'); // example
const isValid = verifyHmac(body, signature, process.env.PAYMENT_WEBHOOK_SECRET);
if (!isValid) return new Response('Unauthorized', { status: 401 });
```

The webhook endpoint must:
1. Validate the signature before any DB writes
2. Be idempotent — a duplicate webhook for the same `payment_reference` should be a no-op
3. Return 200 quickly — do heavy work async if needed

---

## 5. Points Spending at Checkout (Redeem Flow)

Per spec: users can spend points at checkout like cash (1 point = 1 ILS) while balance < 2000.

```
At checkout:
  - If user is authenticated + has points balance > 0:
    → Show "Use X points (= X ILS discount)"
    → User selects full or partial redemption amount
  - Final charge = product.price - points_used
  - If points_used >= product.price → charge = 0 (free order via points)

On order completion:
  - Insert wallet_transaction (type='redeem', points = -points_used)
  - Insert order with amount = original price (before discount)
  - Store points_redeemed on order row (add column: points_redeemed NUMERIC)
```

**Schema addition needed:**
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_redeemed NUMERIC(10,2) NOT NULL DEFAULT 0;
```

---

## 6. Self-Referral Prevention

A referrer must not earn commission when buying through their own link.

```typescript
// In POST /api/payments/webhook, before inserting commission:
const order = await getOrder(order_id);
const referrer = await getReferrerByCode(order.referral_code);

// If the buyer's email matches the referrer's email → skip commission
if (referrer && order.buyer_email === referrer_user_email) {
  // Log it but do not award points
  return;
}
```

---

## 7. Required Environment Variables

```
PAYMENT_PROVIDER=payplus              # or 'meshulam', 'cardcom'
PAYMENT_API_KEY=...
PAYMENT_SECRET=...
PAYMENT_WEBHOOK_SECRET=...            # for HMAC signature verification
PAYMENT_SUCCESS_URL=https://pali.co.il/orders/{order_id}
PAYMENT_CANCEL_URL=https://pali.co.il/cart
```

---

## 8. Required DB Changes (addendum to migration 003)

See [003_security_and_schema_fixes.sql](../supabase/migrations/003_security_and_schema_fixes.sql) for:
- `orders.payment_reference` — gateway transaction ID
- `orders.payment_status` — unpaid / paid / refunded / chargeback

Additional column needed (add to migration 004):
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_redeemed NUMERIC(10,2) NOT NULL DEFAULT 0;
```
