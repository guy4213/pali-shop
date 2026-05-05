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
- [ V ] גישה להזמנה של משתמש אחר — אמורה להיחסם
- [ V ] גישה אנונימית להזמנות — אמורה להיחסם
- [ v ] גישה ל-admin route למשתמש רגיל — אמורה להיחסם

### פרופיל
- [ v ] טעינת פרטי משתמש
- [ V ] שמירת שינויים

### Referral — רכישות
- [ V] קנייה דרך קישור referral → commission נוצר
- [ V] commission מופיע ב-dashboard של הממליץ

### Chat
- [ V] תשובות AI
- [ V] escalation לפנייה
- [ V] שליחת פנייה → מגיעה ל-admin-  
- [ V] מניעת כפילויות

### Admin
- [ V] dashboard stats (מספרים נכונים)
- [V ] products — הוספה / עריכה / מחיקה
- [V ] orders — ניהול + עדכון סטטוס
- [V ] referrers — רשימה + סטטיסטיקות
- [V ] withdrawals — אישור / דחייה

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
