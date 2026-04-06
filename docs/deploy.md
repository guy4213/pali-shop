# מדריך Deploy — Pali Shop

## 1. דרישות מקדימות

- **Node.js** גרסה 18 ומעלה
- **Git**
- **Vercel CLI** — `npm i -g vercel`
- חשבון **Supabase** פעיל עם פרויקט מוכן
- חשבון **Vercel** מחובר ל-GitHub

---

## 2. משתני סביבה

יש להגדיר את כל המשתנים הבאים — ב-Vercel (ובקובץ `.env.local` לפיתוח מקומי):

| משתנה | תיאור |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | כתובת ה-API של פרויקט Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | מפתח anon ציבורי של Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | מפתח service role (סודי — לשרת בלבד) |
| `NEXT_PUBLIC_SITE_URL` | כתובת האתר הציבורית, לדוגמה `https://pali.co.il` |
| `RESEND_API_KEY` | מפתח API של Resend לשליחת מיילים |
| `VONAGE_API_KEY` | מפתח API של Vonage ל-SMS |
| `VONAGE_API_SECRET` | סוד API של Vonage |
| `PAYMENT_API_KEY` | מפתח API של ספק התשלומים |
| `PAYMENT_SECRET` | סוד של ספק התשלומים |
| `PAYMENT_WEBHOOK_SECRET` | סוד לאימות webhook מספק התשלומים |
| `PAYMENT_SUCCESS_URL` | כתובת redirect לאחר תשלום מוצלח |
| `PAYMENT_CANCEL_URL` | כתובת redirect לאחר ביטול תשלום |

---

## 3. הרצת Migrations

יש להריץ את ה-migrations **בסדר הבא** דרך **Supabase → SQL Editor**:

1. `001_*.sql`
2. `002_*.sql`
3. `003_*.sql`
4. `004_points_redeemed.sql`
5. `005_shipping_status.sql`

העתק את תוכן כל קובץ, הדבק ב-SQL Editor ולחץ **Run**.

---

## 4. הגדרת JWT Claim לאדמין

כדי להעניק הרשאות אדמין למשתמש:

1. Supabase → **Authentication** → **Users**
2. בחר את המשתמש הרלוונטי → לחץ **Edit**
3. תחת **app_metadata** הכנס:
   ```json
   {"role": "admin"}
   ```
4. שמור — ה-JWT של המשתמש יכלול את ה-claim בכניסה הבאה.

---

## 5. Deploy ל-Vercel

1. כנס ל-[vercel.com](https://vercel.com) → **Add New Project**
2. ייבא את ה-repo מ-GitHub
3. תחת **Environment Variables** הוסף את כל המשתנים מסעיף 2
4. לחץ **Deploy**

לחלופין דרך CLI:
```bash
vercel --prod
```

---

## 6. DNS

להפנות את הדומיין `pali.co.il` ל-Vercel:

1. Vercel → Project → **Settings** → **Domains** → הוסף `pali.co.il`
2. Vercel תציג ערכי DNS (CNAME או A record)
3. בספק הדומיין — עדכן את הרשומות בהתאם
4. המתן עד 24–48 שעות להפצת DNS

---

## 7. בדיקות לאחר Deploy

לאחר ה-deploy בדוק את הסעיפים הבאים:

1. **דף הבית נטען** — כנס ל-`https://pali.co.il` וודא שהדף עולה ללא שגיאות
2. **התחברות משתמש** — בצע רישום/כניסה וודא שה-session נשמר
3. **הרשאות אדמין** — כנס עם משתמש האדמין וודא גישה לפאנל הניהול
4. **תשלום** — בצע הזמנת מבחן וודא שה-redirect ל-Success/Cancel עובד
5. **שליחת מייל/SMS** — בצע פעולה שמפעילה התראה וודא שהמסר מגיע
