# QA Checklist — Pali Shop

---

## ✅ עובד ואומת

- רכישה רגילה (Buy Now) מקצה לקצה
- Gift flow מקצה לקצה
- התחברות עם magic link
- הגנות routing (redirect ל-login)
- Referral click tracking (תוקן — RLS policy + StrictMode fix)
- Dashboard מציג קליקים נכון
- Wallet — צבירת נקודות
- Admin — support tickets
- Admin — withdrawals (חלקי)

---

## 🔧 ידוע כשבור — צריך תיקון

| בעיה | מה צריך |
|---|---|
| מייל Welcome לא נשלח | להגדיר `RESEND_API_KEY` ב-`.env` + לאמת דומיין ב-Resend |
| SMS לא עובד | אין integration — Vonage keys חסרים |
| Withdrawal — אין feedback | אין spinner / toast / עדכון balance אחרי שליחה |
| מניעת מתנה כפולה | לא נבדק אם חסימה לפי טלפון עובדת |

---

## ⬜ לא נבדק כלל — ממתין לבדיקה ידנית

### עגלה (Cart)
- [ V ] הוספת מוצר לעגלה
- [ V ] עדכון כמות
- [ V ] שמירה אחרי refresh
- [ V ] checkout מהעגלה
- [ V ] hover preview

### מעקב הזמנה (`/track`)
- [ V ] שליפת הזמנה לפי מזהה
- [ V ] הצגת סטטוס

### היסטוריית הזמנות
- [ V ] רשימת הזמנות של משתמש
- [ V ] כניסה להזמנה בודדת
- [ V ] empty state

### אבטחה (קריטי לפרודקשן)
- [ ] גישה להזמנה של משתמש אחר — אמורה להיחסם
- [ ] גישה אנונימית להזמנות — אמורה להיחסם
- [ ] גישה ל-admin route למשתמש רגיל — אמורה להיחסם

### פרופיל
- [ ] טעינת פרטי משתמש
- [ ] שמירת שינויים

### Referral — רכישות
- [ ] קנייה דרך קישור referral → commission נוצר
- [ ] commission מופיע ב-dashboard של הממליץ

### Chat
- [ ] תשובות AI
- [ ] escalation לפנייה
- [ ] שליחת פנייה → מגיעה ל-admin
- [ ] מניעת כפילויות

### Admin
- [ ] dashboard stats (מספרים נכונים)
- [ ] products — הוספה / עריכה / מחיקה
- [ ] orders — ניהול + עדכון סטטוס
- [ ] referrers — רשימה + סטטיסטיקות
- [ ] withdrawals — אישור / דחייה

---

## 📋 סדר עדיפויות מוצע

1. **אבטחה** — orders + admin access (קריטי לפרודקשן)
2. **Email** — להגדיר RESEND_API_KEY
3. **Withdrawal** — לתקן UI feedback
4. **Referral purchases** — לבדוק commissions
5. **Cart** — מודול שלם שלא נבדק
6. **Admin** — ניהול מלא
7. **Chat** — flow שלם
8. **Tracking + History** — עמודים משניים
