## What I implemented
Added a `POST /api/wallet/add-points` endpoint that atomically adds points to a user's wallet via a Supabase RPC call (`add_wallet_points`), enforcing session-based authentication to prevent users from modifying other users' wallets.

## Files changed
- `pali-app/src/app/api/wallet/add-points/route.ts` (created)

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
- The atomic update is performed via `supabase.rpc('add_wallet_points', { p_user_id, p_amount })`. This RPC must be defined in the database as a SQL function that executes `UPDATE wallets SET points = points + p_amount WHERE user_id = p_user_id RETURNING points`, raising a `P0001` exception when no row is found.
- Auth check: `userId !== user.id` returns 403. Zod schema rejects empty `userId` (min(1)) and non-positive `amount` with 400.
- `newBalance` is the value returned directly from the DB after the update — no local arithmetic.
- The only `console.error` is in the catch block for unexpected server errors, matching the pattern used in `wallet/withdraw/route.ts`.
