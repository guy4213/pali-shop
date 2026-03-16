## What I implemented
A `POST /api/wallet/add-points` endpoint that atomically adds points to a referrer's wallet balance using a PostgreSQL function, with authentication, input validation, and proper error handling.

## Files changed
- `pali-app/supabase/migrations/003_add_wallet_points.sql` — adds `points NUMERIC` column to `referrers` table and creates the `add_referrer_wallet_points` PL/pgSQL function that performs the atomic `points = points + p_amount` UPDATE
- `pali-app/src/app/api/wallet/add-points/route.ts` — the Next.js API route handler

## How to verify

- [ ] endpoint קיים ומגיב על POST /api/wallet/add-points
- [ ] authentication — userId בבקשה חייב להתאים ל-session (לא ניתן לעדכן ארנק של משתמש אחר)
- [ ] update הוא atomic: `points = points + amount` בשאילתת SQL אחת — לא fetch + calculate + write
- [ ] אם ה-update לא עדכן שורה — מחזיר 404
- [ ] amount שלילי או אפס מחזיר 400
- [ ] userId ריק מחזיר 400
- [ ] newBalance בתשובה הוא הערך החדש מה-DB (לא חישוב לוקאלי)
- [ ] אין console.log מיותרים
- [ ] הקוד תואם לסגנון הקיים ב-CONTEXT.md

**Implementation notes:**
- The atomic update is implemented as a PL/pgSQL function (`add_referrer_wallet_points`) called via `supabase.rpc()`. This is required because the Supabase JS client does not support column-arithmetic updates (`col = col + val`) directly.
- The function returns `NULL` when no row matches (referrer not found for the given `user_id`), which the route maps to a 404 response — satisfying the rowCount=0 check.
- `newBalance` is returned from the `RETURNING points` clause inside the SQL function, so it is always the DB value after the update, never a local calculation.
- Migration `003_add_wallet_points.sql` must be applied before using the endpoint. It adds a `points` column (default 0) to `referrers` and creates the RPC function.
- userId mismatch (trying to update another user's wallet) returns 403.
