# 🏢 Golden Score - בודק חברות ישראלי

מערכת לבדיקת חברות ישראליות בזמן אמת עם אינטגרציה ישירה למאגרי מידע ממשלתיים.

## 🎯 פיצ'רים

- ✅ חיפוש חברות (ח.פ / שם)
- ✅ מידע בסיסי על חברות
- ✅ שינויים בחברה
- ✅ כונס נכסים/נאמן והליכי פירוק
- ✅ תביעות חוב
- ✅ **חדשות ועדכונים** - אגרגציה אוטומטית של חדשות מגוגל חדשות ותקשורת ישראלית
- 🔜 ייצוא לPDF
- 🔜 הליכי חדלות פירעון מפורטים
- 🔜 תביעות משפטיות

## 🛠️ טכנולוגיות

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript + JavaScript
- **Icons**: Lucide React
- **Data**: data.gov.il API

## 🚀 התקנה והרצה

### 1. התקנת תלויות
```bash
npm install
```

### 2. הגדרת סביבה
צור קובץ `.env.local` והגדר את משתני הסביבה הנדרשים.  

### 3. הרצה
```bash
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000)

## 📚 תיעוד

- [ארכיטקטורה מפורטת](./docs/ARCHITECTURE.md) - מבנה הפרויקט, services, ו-data flow
- [ROADMAP](./docs/ROADMAP.md) - תכנון פיתוח עתידי

---

## 🚀 Deployment

### Deploy to Vercel (Recommended - Free)

**Quick Start:**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New..." → "Project"
   - Import `golden-score` repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables:**
   - In Vercel: Settings → Environment Variables
   - Copy all values from your `.env.local`:
     ```
     RESOURCE_ID_COMPANIES=your-value
     RESOURCE_ID_CHANGES=your-value
     RESOURCE_ID_TRUSTEE_2018=your-value
     RESOURCE_ID_BANKRUPTCY_2018=your-value
     RESOURCE_ID_CLAIMS_2018=your-value
     DATA_GOV_API_URL=https://data.gov.il/api/3/action
     ENABLE_DEBUG_LOGS=false
     NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app
     ```
   - Select: Production, Preview, Development for each

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Continuous Deployment

Every push to `main` automatically deploys to production.  
Every PR gets a unique preview URL for testing.

**📖 Full deployment guide:** [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 🔢 Versioning

This project uses semantic versioning: `MAJOR.MINOR.PATCH`

### Automatic Version Bumping

Every push to `main` automatically bumps the **patch** version (0.0.1 → 0.0.2)

### Manual Version Bumping

```bash
# Bump patch version (0.0.1 → 0.0.2) - for bug fixes
npm run version:patch

# Bump minor version (0.1.0 → 0.2.0) - for new features
npm run version:minor

# Bump major version (1.0.0 → 2.0.0) - for breaking changes
npm run version:major

# Or use the script:
./scripts/bump-version.sh patch  # default
./scripts/bump-version.sh minor
./scripts/bump-version.sh major
```

Current version: Check `package.json`

---

## 📊 Environment Variables

Required for deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| `RESOURCE_ID_COMPANIES` | data.gov.il companies dataset ID | ✅ |
| `RESOURCE_ID_CHANGES` | data.gov.il changes dataset ID | ✅ |
| `RESOURCE_ID_TRUSTEE_2018` | Trustee records 2018+ | ✅ |
| `RESOURCE_ID_BANKRUPTCY_2018` | Bankruptcy records 2018+ | ✅ |
| `RESOURCE_ID_CLAIMS_2018` | Claims records 2018+ | ✅ |
| `DATA_GOV_API_URL` | Base URL for data.gov.il API | ✅ |
| `ENABLE_DEBUG_LOGS` | Enable debug logging (false in prod) | ❌ |
| `NEXT_PUBLIC_API_BASE_URL` | Public API base URL | ✅ |

**⚠️ Never commit `.env.local` to Git!** It's in `.gitignore` for security.

---

