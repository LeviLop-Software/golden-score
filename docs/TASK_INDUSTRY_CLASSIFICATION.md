# משימה: סיווג ענפי אוטומטי לחברות

## מטרה
כל חברה במערכת תקבל סיווג ענפי אוטומטי באמצעות AI, על סמך המידע הקיים עליה.

---

## שדות רלוונטיים לסיווג

| שדה | תיאור | דוגמה | מקור |
|-----|-------|-------|------|
| `name` | שם החברה בעברית | "מיקרוסופט ישראל בע״מ" | רשם החברות |
| `englishName` | שם החברה באנגלית | "Microsoft Israel Ltd" | רשם החברות |
| `purpose` | מטרות החברה | "פיתוח תוכנה ומתן שירותי ייעוץ" | רשם החברות |
| `city` | עיר הרישום | "תל אביב" | רשם החברות |
| `type` | סוג החברה | "חברה פרטית" | רשם החברות |
| `status` | סטטוס החברה | "פעילה" | רשם החברות |
| `news` | כותרות חדשות אחרונות | "מיקרוסופט השיקה מוצר AI חדש" | Google News |

> ⚡ **חשוב:** החדשות (`news`) מספקות הקשר עדכני על פעילות החברה ויכולות לשפר משמעותית את דיוק הסיווג

---

## ענפים אפשריים

מוגדרים בקובץ [`src/data/industries.json`](../src/data/industries.json):

| קוד | עברית | English |
|-----|-------|---------|
| `technology` | טכנולוגיה | Technology |
| `banking_finance` | בנקאות ופיננסים | Banking & Finance |
| `real_estate` | נדל״ן | Real Estate |
| `healthcare` | בריאות | Healthcare |
| `manufacturing` | תעשייה | Manufacturing |
| `retail` | קמעונאות | Retail |
| `food_beverage` | מזון ומשקאות | Food & Beverage |
| `construction` | בנייה | Construction |
| `transportation` | תחבורה | Transportation |
| `energy` | אנרגיה | Energy |
| `education` | חינוך | Education |
| `legal_services` | שירותים משפטיים | Legal Services |
| `consulting` | ייעוץ | Consulting |
| `media_marketing` | תקשורת ושיווק | Media & Marketing |
| `tourism` | תיירות | Tourism |
| `general` | כללי (אין סיווג) | General ❌ |

> 📁 מילות מפתח לכל ענף מוגדרות ב-[`src/data/keywords.json`](../src/data/keywords.json)

---

## שלבי ביצוע

> ✅ **כבר קיים בפרויקט:** טעינת נתוני חברה מרשם החברות + שאיבת חדשות מ-Google News

### שלב 1: קריאה ל-AI (Gemini) ✅
- [x] בנה prompt עם כל פרטי החברה **כולל החדשות**
- [x] שלח ל-Gemini API
- [x] בקש תשובה בפורמט JSON

> 📁 נוצר: `app/api/classify/[companyId]/route.js`  
> 📁 עודכן: `src/services/classificationService.js`

### שלב 2: עיבוד התשובה ✅
- [x] אם `confidence >= 0.5` → השתמש בסיווג
- [x] אם `confidence < 0.5` → סמן כ-"general" (אין סיווג)
- [x] שמור את התוצאה ב-cache

> 📁 נוצר: `src/data/classification-cache.json`  
> ⚙️ הלוגיקה ב-`classificationService.js` מטפלת בכל המקרים

### שלב 3: הצגה בממשק ✅
- [x] הוסף badge עם הסיווג בכרטיס החברה
- [x] הצג tooltip עם ההסבר
- [x] אפשר לחיצה לסיווג מחדש

> 📁 נוצר: `src/components/IndustryBadge.jsx`  
> 📁 עודכן: `src/components/CompanyCard.jsx`

> ⚠️ **סדר הפעולות חשוב:** סיווג מתבצע רק **אחרי** שהחדשות נטענו!

---

## מבנה הקריאה ל-AI

### AI Agent (פרסונה)
```
אתה מומחה לניתוח עסקי של חברות ישראליות.
תפקידך לסווג חברות לענפים על סמך השם, המטרות והמיקום שלהן.
אתה מכיר היטב את השוק הישראלי ואת החברות הפעילות בו.
```

### מבנה הבקשה (Request)
```json
{
  "company": {
    "name": "שם החברה בעברית",
    "englishName": "Company Name in English",
    "purpose": "מטרות החברה מרשם החברות",
    "city": "עיר הרישום",
    "type": "סוג החברה",
    "status": "סטטוס החברה",
    "news": [
      "כותרת חדשה 1 על החברה",
      "כותרת חדשה 2 על החברה",
      "כותרת חדשה 3 על החברה"
    ]
  },
  "industries": [
    "technology", "banking_finance", "real_estate", "healthcare",
    "manufacturing", "retail", "food_beverage", "construction",
    "transportation", "energy", "education", "legal_services",
    "consulting", "media_marketing", "tourism", "general"
  ],
  "instructions": "סווג את החברה לענף אחד בלבד. השתמש בחדשות להבנת תחום הפעילות. אם לא ניתן לקבוע בביטחון סביר - החזר general."
}
```

### Prompt Template
```
You are an expert business analyst specializing in Israeli companies.
Classify this company into ONE industry sector.

Company Details:
- Name (Hebrew): {name}
- Name (English): {englishName}
- Business Purpose: {purpose}
- City: {city}

Recent News Headlines:
{news_headlines}

Available Industries:
technology, banking_finance, real_estate, healthcare, manufacturing,
retail, food_beverage, construction, transportation, energy,
education, legal_services, consulting, media_marketing, tourism, general

Rules:
1. Choose exactly ONE industry
2. Use the news headlines to understand what the company actually does
3. If unclear or generic purpose like "לעסוק בכל עיסוק חוקי" - check the news first
4. If still unclear - return "general"
5. Confidence must reflect your certainty (0.0 to 1.0)
6. Provide reasoning in Hebrew

Respond in JSON format only.
```

---

## מבנה התשובה (Response)

### תשובה מוצלחת
```json
{
  "industry": "technology",
  "confidence": 0.85,
  "reasoning": "שם החברה מכיל מונחים טכנולוגיים ומטרות החברה כוללות פיתוח תוכנה"
}
```

### תשובה כאשר לא ניתן לסווג
```json
{
  "industry": "general",
  "confidence": 0.3,
  "reasoning": "מטרות החברה גנריות מדי ולא ניתן לקבוע ענף ספציפי"
}
```

### שדות התשובה

| שדה | סוג | תיאור |
|-----|-----|-------|
| `industry` | string | קוד הענף מרשימת הענפים |
| `confidence` | number | רמת ביטחון 0.0-1.0 |
| `reasoning` | string | הסבר קצר בעברית |

---

## לוגיקת קבלת החלטה

```
┌─────────────────────────────────────┐
│         קבלת פרטי חברה              │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│     שאיבת חדשות מ-Google News       │
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  קריאה ל-Gemini AI (עם החדשות)     │
└─────────────────┬───────────────────┘
                  ▼
         confidence >= 0.5?
              /      \
           כן          לא
            │           │
            ▼           ▼
   ┌─────────────┐  ┌─────────────┐
   │ השתמש בענף  │  │  general    │
   │   שהוחזר    │  │ (אין סיווג) │
   └─────────────┘  └─────────────┘
```

---

## כללים חשובים

1. **סף סביר** - `confidence >= 0.5` נחשב לסיווג תקף
2. **אין לנחש** - אם ה-AI לא בטוח, להחזיר "general"
3. **שקיפות** - תמיד להציג את ההסבר (`reasoning`)
4. **מהירות** - שימוש ב-cache למניעת קריאות חוזרות
5. **עלות** - להישאר במגבלות Free tier של Gemini

---

## קבצים

| קובץ | תיאור |
|------|-------|
| [`src/data/industries.json`](../src/data/industries.json) | הגדרת 16 הענפים |
| [`src/data/keywords.json`](../src/data/keywords.json) | מילות מפתח לכל ענף |
| `src/services/classificationService.js` | לוגיקת הסיווג |
| `.env.local` | מפתח `GEMINI_API_KEY` |

---

## סטטוס
- [x] הגדרת ענפים (industries.json)
- [x] מילות מפתח (keywords.json)
- [x] חיבור ל-Gemini API
- [x] שילוב בממשק המשתמש
- [ ] בדיקות
