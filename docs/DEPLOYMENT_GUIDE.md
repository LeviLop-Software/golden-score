# 🚀 הדרכת Deploy ל-Vercel

## שלב 1: הכנת הפרויקט

### 1.1 יצירת קובץ Environment Variables Template
כבר קיים `.env.example` - ודא שהוא מעודכן עם כל המשתנים הנחוצים.

### 1.2 עדכון .gitignore
ודא ש-`.env.local` ו-`.env*.local` נמצאים ב-.gitignore ✅

## שלב 2: העלאת הפרויקט ל-GitHub

### 2.1 יצירת Repository חדש (אם עדיין לא נעשה)
```bash
# אם עדיין לא עשית init
git init

# הוסף את כל הקבצים (למעט .env.local שב-gitignore)
git add .

# Commit ראשון
git commit -m "Add deployment configuration for Vercel"

# צור repository ב-GitHub ואז:
git remote add origin https://github.com/LeviLop-Software/golden-score.git
git branch -M main
git push -u origin main
```

## שלב 3: Deploy ל-Vercel

### 3.1 התחברות לVercel
1. גש ל-https://vercel.com
2. התחבר עם חשבון GitHub שלך
3. לחץ על "Add New..." → "Project"

### 3.2 ייבוא הפרויקט מGitHub
1. בחר את הrepository: `golden-score`
2. Vercel יזהה אוטומטית שזה Next.js
3. לחץ על "Import"

### 3.3 הגדרת Environment Variables
**חשוב מאוד!** לפני שלוחצים Deploy:

1. לחץ על "Environment Variables"
2. העתק את כל המשתנים מ-`.env.local` שלך:

```
RESOURCE_ID_COMPANIES=your-value-here
RESOURCE_ID_CHANGES=your-value-here
RESOURCE_ID_TRUSTEE_2018=your-value-here
RESOURCE_ID_BANKRUPTCY_2018=your-value-here
RESOURCE_ID_CLAIMS_2018=your-value-here
DATA_GOV_API_URL=https://data.gov.il/api/3/action
CACHE_TTL_COMPANIES=86400000
CACHE_TTL_CHANGES=3600000
CACHE_TTL_TRUSTEE=43200000
CACHE_TTL_DATA_GOV=43200000
ENABLE_CACHE=true
ENABLE_DEBUG_LOGS=false
NEXT_PUBLIC_APP_NAME=Golden Score
NEXT_PUBLIC_API_BASE_URL=https://your-project.vercel.app
```

3. בחר "Production", "Preview", ו-"Development" לכל משתנה
4. לחץ על "Add" לכל משתנה

### 3.4 Deploy!
1. לחץ על "Deploy"
2. המתן 2-3 דקות
3. 🎉 האתר שלך חי!

## שלב 4: הגדרות Post-Deploy

### 4.1 Custom Domain (אופציונלי)
1. Settings → Domains
2. הוסף את הדומיין שלך
3. עדכן DNS records כפי שמוצג

### 4.2 עדכון NEXT_PUBLIC_API_BASE_URL
1. Settings → Environment Variables
2. ערוך את `NEXT_PUBLIC_API_BASE_URL`
3. שנה ל-URL האמיתי: `https://your-project.vercel.app`
4. Redeploy (Deployments → Latest → "...") → Redeploy

### 4.3 הפעלת Analytics (אופציונלי)
1. Analytics → Enable
2. קבל תובנות על ביצועים בחינם

## שלב 5: CI/CD אוטומטי

מעכשיו, כל push ל-GitHub יפעיל deploy אוטומטי! 🚀

```bash
# תעשה שינויים בקוד
git add .
git commit -m "Add new feature"
git push

# Vercel יעשה deploy אוטומטית!
```

### Preview Deployments
- כל PR (Pull Request) מקבל preview URL ייחודי
- מושלם לבדיקות לפני merge

## שלב 6: ניטור והתראות

### 6.1 Vercel Dashboard
- https://vercel.com/dashboard
- צפה ב-deployments, logs, analytics

### 6.2 הגדרת Notifications
1. Settings → Notifications
2. בחר Slack/Email/Discord
3. קבל התראות על deploy failures

## פתרון בעיות נפוצות

### בעיה: "Module not found"
**פתרון:** ודא ש-`package.json` מעודכן ו-`npm install` רץ בהצלחה

### בעיה: "Environment variable not defined"
**פתרון:** 
1. Settings → Environment Variables
2. ודא שכל המשתנים מוגדרים
3. Redeploy

### בעיה: Build failed
**פתרון:**
1. בדוק את ה-logs ב-Vercel dashboard
2. הרץ `npm run build` לוקלית לבדיקה
3. תקן שגיאות ו-push שוב

### בעיה: API routes לא עובדים
**פתרון:**
- ודא ש-`NEXT_PUBLIC_API_BASE_URL` מצביע ל-Vercel URL
- בדוק ש-CORS מוגדר נכון

## Security Checklist ✅

- [x] `.env.local` ב-gitignore
- [x] Environment variables בVercel בלבד
- [x] לא יש secrets בקוד
- [x] HTTPS enabled (אוטומטי בVercel)
- [ ] Rate limiting enabled (TODO)
- [ ] Authentication enabled (TODO)

## עדכון Production

```bash
# Development branch
git checkout -b feature/new-feature
# ... עבוד על הפיצ'ר החדש
git commit -m "Add new feature"
git push origin feature/new-feature

# צור PR ב-GitHub
# Vercel תיצור preview deployment

# אחרי בדיקה, merge ל-main
# Vercel תעשה deploy לproduction אוטומטית!
```

## Links שימושיים

- **Dashboard**: https://vercel.com/dashboard
- **Docs**: https://nextjs.org/docs/deployment
- **Support**: https://vercel.com/support

---

**🎉 מזל טוב! האתר שלך חי ב-production!**

הURL: `https://your-project.vercel.app`
