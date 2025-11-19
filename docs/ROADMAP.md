# Golden Score - Roadmap & Future Features

## 🎯 מטרה
מסמך זה מכיל רעיונות לפיצ'רים עתידיים למערכת Golden Score. כל פיצ'ר מדורג לפי עדיפות וקושי יישום.

---

## 📋 תכנית עבודה

### 🔥 High Priority

#### 4. שיתוף וקישור ישיר
**מצב**: לא הותחל  
**קושי**: 🟢 קל  
**זמן משוער**: 2-3 שעות

**תיאור**:
- כפתור "העתק קישור" לדף חברה
- שיתוף ב-WhatsApp/Email/LinkedIn
- הודעת "הקישור הועתק!" (toast notification)

**דרישות טכניות**:
- `navigator.clipboard.writeText()`
- WhatsApp share URL: `https://wa.me/?text=`
- Email: `mailto:?subject=&body=`

**קבצים לעריכה**:
- `src/components/CompanyCard.jsx` - כפתורי שיתוף
- עיצוב: כפתורים עם אייקונים מ-lucide-react

---

#### 14. Rate Limiting
**מצב**: לא הותחל  
**קושי**: 🟡 בינוני  
**זמן משוער**: 4-6 שעות

**תיאור**:
- הגנה מפני spam ל-APIs ממשלתיים
- הגבלת מספר בקשות לכתובת IP
- הצגת הודעה ידידותית כשמגיעים למגבלה

**דרישות טכניות**:
- Middleware ב-Next.js API routes
- In-memory store (או Redis בעתיד)
- משתני סביבה: `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_SECONDS`

**קבצים ליצירה**:
- `src/middleware/rateLimit.js`
- עדכון כל ה-API routes ב-`app/api/`

**אסטרטגיה**:
```javascript
// IP-based rate limiting
const requests = new Map(); // IP -> { count, resetTime }
// Check: if count > limit → return 429 Too Many Requests
```

---

### 💡 Medium Priority

#### 6. התראות ומעקב
**מצב**: לא הותחל  
**קושי**: 🔴 קשה  
**זמן משוער**: 2-3 ימים

**תיאור**:
- "עקוב אחרי חברה זו" - כפתור בדף החברה
- התראת email כשיש שינויים בחברה
- דורש backend עם DB ו-cron jobs

**דרישות טכניות**:
- Database (PostgreSQL/MongoDB) לשמירת מעקבים
- Email service (Resend/SendGrid)
- Cron job לבדיקה יומית
- Authentication (NextAuth.js)

**Architecture**:
```
User → Subscribe → DB
Cron (daily) → Check changes → Send email
```

**שלבי יישום**:
1. הוסף DB schema: `users`, `watchlist`
2. API routes: `/api/watchlist/add`, `/api/watchlist/remove`
3. Cron job: `/api/cron/check-changes`
4. Email templates עם Resend

---

#### 8. גרף מגמות
**מצב**: לא הותחל  
**קושי**: 🟡 בינוני  
**זמן משוער**: 6-8 שעות

**תיאור**:
- Timeline ויזואלי של שינויים בחברה
- גרף זמן עם נקודות אירועים
- סינון לפי סוג אירוע (שינוי בע"מ, חדלות פירעון, וכו')

**דרישות טכניות**:
- ספריית גרפים: `recharts` או `chart.js`
- עיבוד נתוני ההיסטוריה למבנה timeline
- Responsive design

**קבצים ליצירה**:
- `src/components/CompanyTimeline.jsx`
- `src/lib/timelineUtils.js` - פונקציות עזר

**Data Structure**:
```javascript
[
  { date: '2024-01-15', type: 'change', title: 'שינוי בעלים' },
  { date: '2023-06-20', type: 'insolvency', title: 'הליך פירוק' }
]
```

---

#### 9. ציון אמינות חכם
**מצב**: לא הותחל (כרגע ציון בסיסי)  
**קושי**: 🟡 בינוני  
**זמן משוער**: 1-2 ימים

**תיאור**:
- אלגוריתם משוכלל לחישוב ציון אמינות
- משקלות לפי: גיל חברה, מספר שינויים, הליכים משפטיים, כונס נכסים
- הסבר לציון (למה 65? מה משפיע?)

**נוסחה מוצעת**:
```javascript
score = 100
- (insolvencyCases * 20)           // חדלות פירעון
- (trusteeRecords * 15)             // כונס נכסים
- (changeFrequency * 5)             // תדירות שינויים
+ (companyAge > 5 ? 10 : 0)        // בונוס לחברות ותיקות
```

**קבצים לעריכה**:
- `src/lib/scoring.js` - לייצר מחדש (נמחק)
- `src/components/CompanyCard.jsx` - הצגת הסבר

**UI Enhancement**:
- Tooltip עם פירוט הציון
- גרף breakdown (60% סטטוס, 20% היסטוריה...)

---

#### 10. סטטיסטיקות
**מצב**: לא הותחל  
**קושי**: 🟡 בינוני  
**זמן משוער**: 4-5 שעות

**תיאור**:
- "דירוג התחום" (אם יש מידע על תחום)
- סטטיסטיקות כלליות (כמה חברות במאגר, ממוצע ציון)

**דרישות טכניות**:
- Analytics DB או localStorage לספירה
- API route: `/api/stats`
- Component: `<StatsWidget />`

**מיקום בUI**:
- Dashboard - כרטיסיות קטנות בעמוד הבית
- עדכון בזמן אמת (או cache של 1 שעה)

**Data Points**:
```javascript
{
  companiesCheckedToday: 142,
  totalCompanies: 15234,
  avgScore: 72,
  popularSearches: ['חברת א', 'חברת ב']
}
```

---

#### 11. Dark Mode
**מצב**: לא הותחל  
**קושי**: 🟢 קל-בינוני  
**זמן משוער**: 3-4 שעות

**תיאור**:
- מתג בין מצב בהיר לכהה
- שמירת העדפה ב-localStorage
- אנימציית מעבר חלקה

**דרישות טכניות**:
- Context API או `next-themes`
- TailwindCSS dark mode classes
- אייקון שמש/ירח

**יישום**:
```javascript
// Using next-themes
import { ThemeProvider } from 'next-themes'

// In layout.tsx
<ThemeProvider attribute="class" defaultTheme="light">
  {children}
</ThemeProvider>
```

**קבצים לעריכה**:
- `app/layout.tsx` - wrap with ThemeProvider
- `src/components/ThemeToggle.jsx` - כפתור מתג
- `tailwind.config.js` - enable dark mode

---

#### 13. חיפוש משופר
**מצב**: לא הותחל  
**קושי**: 🟡 בינוני  
**זמן משוער**: 6-8 שעות

**תיאור**:
- "חיפושים פופולריים" מתחת לשדה
- חיפוש לפי תחום/תעשייה
- סינונים מתקדמים

**דרישות טכניות**:
- סינון צד לקוח
- Debouncing חכם יותר

**Features**:
- 📌 הצעות: "האם התכוונת ל-X?"
- 🔥 "נבדקו לאחרונה"
- 🏢 סינון לפי סוג תאגיד
- 📍 סינון לפי מיקום (אם יש)

**קבצים לעריכה**:
- `src/components/AutoComplete.jsx` - שיפור
- `src/hooks/useCompanySearch.js` - לוגיקת חיפוש

---

### 🚀 Advanced / Future

#### 18. דוחות מתקדמים
**מצב**: לא הותחל  
**קושי**: 🔴 קשה  
**זמן משוער**: 3-4 ימים

**תיאור**:
- ייצוא ל-Excel/CSV עם כל הנתונים
- דוחות תקופתיים (ריכוז שבועי/חודשי)
- תבניות מותאמות אישית
- PDF מתקדם עם גרפים

**דרישות טכניות**:
- Excel: `xlsx` library
- CSV: native JS
- PDF מתקדם: `@react-pdf/renderer` או `puppeteer`
- Templates engine

**Types של דוחות**:
1. **דוח בודד**: כל המידע על חברה אחת
2. **דוח השוואתי**: 2-5 חברות side-by-side
3. **דוח תקופתי**: כל החברות שנבדקו השבוע
4. **דוח מותאם**: בחירת שדות ספציפיים

**קבצים ליצירה**:
- `src/lib/exporters/excel.js`
- `src/lib/exporters/csv.js`
- `src/lib/exporters/advancedPdf.js`
- `src/components/ReportBuilder.jsx` - UI לבניית דוחות

**API Routes**:
- `/api/reports/generate` - יצירת דוח
- `/api/reports/templates` - ניהול תבניות

---

## 🚫 הערות חשובות על מקורות נתונים

### תביעות משפטיות ופסקי דין
**מצב**: לא זמין - דורש API בתשלום  
**תאריך עדכון**: 19 נובמבר 2025

**הבעיה**:
אין מקור נתונים חופשי וזמין לתביעות משפטיות ופסקי דין:
- justice.gov.il - אין API ציבורי, דורש web scraping (לא אמין)
- psakdin.co.il - אתר מסחרי, אין API פתוח

**פתרונות מסחריים זמינים**:
| שירות | תיאור | עלות משוערת |
|-------|--------|--------------|
| **Polaris Law API** | מאגר פסקי דין ותיקים משפטיים | 300-500 ₪/חודש + תשלום לפי שימוש |
| **Nevo API** | מאגר נבו - פסיקה, חקיקה, ספרות | 800-1,200 ₪/חודש (מנוי מוסדי) |
| **Takdin API** | מערכת תקדין - פסקי דין | 400-700 ₪/חודש |
| **Justicetool** | כלי עבודה לעורכי דין | 1,000+ ₪/חודש |
| **BDi Code / Coface** | דוחות אשראי מסחריים (כולל הליכים משפטיים) | 15-50 ₪ לדוח + מנוי |

**סטטוס נוכחי**:
- ✅ מוצג placeholder "בקרוב" בעמוד החברה
- ✅ הסבר למשתמש למה הפיצ'ר טרם זמין
- ⏳ ממתין להחלטה על תקציב

**אפשרויות עתידיות**:
1. 💰 **BDi/Coface** - מומלץ ביותר (עלות סבירה, נתונים מהימנים)
2. 💰 **Polaris Law** - אם צריך רק פסקי דין
3. 🏛️ **Nevo/Takdin** - למערכת מתקדמת עם תקציב גדול

---

### חדלות פירעון וכונסי נכסים
**מצב**: ✅ עובד מצוין!  
**מקור נתונים**: data.gov.il - מאגר PR2018

**מה זמין**:
- ✅ חברות בפירוק (liquidated companies)
- ✅ חייבים בהליך פשיטת רגל (bankruptcy debtors)
- ✅ תביעות חוב (debt claims)
- ✅ מידע על כונסי נכסים ונאמנים
- ✅ סטטיסטיקות והיסטוריה

**קבצים**:
- `src/services/trusteeService.ts` - שירות כונס נכסים
- `src/services/insolvencyService.ts` - שירות חדלות פירעון
- `src/components/TrusteeCard.tsx` - תצוגת כונס נכסים
- `src/components/CompanyInsolvencyList.jsx` - תצוגת הליכים

---

## 📊 מטריקות הצלחה

לכל פיצ'ר נמדוד:
- **Adoption Rate**: כמה משתמשים משתמשים בפיצ'ר?
- **User Feedback**: האם הפיצ'ר שימושי?
- **Performance Impact**: האם הפיצ'ר מאט את המערכת?

---

## 🎨 עקרונות עיצוב

בכל פיצ'ר חדש:
1. ✅ **RTL First** - תמיד לחשוב על עברית
2. ✅ **Mobile Friendly** - responsive מהיום הראשון
3. ✅ **Accessible** - ARIA labels, keyboard navigation
4. ✅ **Progressive Enhancement** - עובד גם בלי JS
5. ✅ **Fast** - loading states, optimistic updates

---

## 📝 הערות

- כל פיצ'ר צריך tests (unit + integration)
- עדכון ARCHITECTURE.md אחרי כל פיצ'ר גדול
- Commit messages בפורמט: `feat: description`, `fix: description`
- Code review לפני merge (אם יש צוות)

---

**עדכון אחרון**: 19 נובמבר 2025
