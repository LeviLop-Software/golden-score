/**
 * שירות כונס נכסים / נאמן (Trustee Service)
 * 
 * מטרה: שירות לטעינת נתונים על כונסי נכסים ונאמנים ממאגר PR2018 של data.gov.il
 * 
 * **הערה חשובה**: 
 * רק מאגר "חברות בפירוק" מכיל מספר ח.פ לחיפוש.
 * המאגרים האחרים (חייבים בהליך, תביעות חוב) לא מכילים מספר זיהוי וניתנים לחיפוש רק לפי מזהה תיק פנימי.
 * 
 * המקור:
 * - חברות בפירוק - Resource ID: d8715392-287f-49b7-9ae3-f21ec5bf55f3
 *   שדות: מספר זיהוי של החברה, שם החברה, סטטוס תיק, תאריך קבלת צו פירוק, בית משפט
 * 
 * פונקציונליות:
 * - טעינת נתונים ממאגר חברות בפירוק
 * - סינון לפי מספר ח.פ
 * - Caching של 24 שעות
 * - טיפול בשגיאות
 * 
 * TODO עתידי:
 * - הוספת מאגרים נוספים שמכילים מספר זיהוי
 * - חיפוש לפי שם חברה
 * - קישור למאגרים אחרים דרך מזהה תיק
 * - ייצוא ל-PDF
 */

import { searchRecords } from './dataGovService';

// Resource IDs ממאגר PR2018
const RESOURCE_IDS = {
  LIQUIDATED_COMPANIES: 'd8715392-287f-49b7-9ae3-f21ec5bf55f3', // חברות בפירוק - יש ח.פ
  BANKRUPTCY_DEBTORS: '2156937e-524a-4511-907d-5470a6a5264f',   // חייבים בהליך - אין ח.פ, יש מזהה תיק
  DEBT_CLAIMS: '3cb25b2e-a501-4870-86a6-30be8d8e80a5',          // תביעות חוב - אין ח.פ, יש מזהה תיק
} as const;

// Cache
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 שעות
const cache = new Map<string, { data: TrusteeData; timestamp: number }>();

/**
 * ממשק למידע על כונס/נאמן
 */
export interface TrusteeInfo {
  name: string;                    // שם הכונס/נאמן
  phone?: string;                  // טלפון
  email?: string;                  // אימייל
  appointmentDate?: string;        // תאריך מינוי
  status?: string;                 // סטטוס (פעיל/לא פעיל)
}

/**
 * ממשק להליך משפטי
 */
export interface LegalProcedure {
  type: 'bankruptcy' | 'liquidation' | 'claim'; // סוג ההליך
  fileNumber?: string;             // מספר תיק
  openingDate?: string;            // תאריך פתיחה
  closingDate?: string;            // תאריך סגירה
  status: string;                  // סטטוס
  amount?: number;                 // סכום (לתביעות)
  claimant?: string;               // שם התובע (לתביעות)
  claimantType?: string;           // סוג תובע החוב
  systemType?: string;             // סוג מערכת
  debtCreationDate?: string;       // תאריך יצירת החוב
  approvedAmount?: number;         // סכום שאושר
  approvedRegularAmount?: number;  // סכום שאושר כתביעת חוב רגילה
  approvedPriorityAmount?: number; // סכום שאושר בדין קדימה
}

/**
 * ממשק לנתוני כונס מלאים
 */
export interface TrusteeData {
  companyId: string;               // ח.פ החברה
  companyName: string;             // שם החברה
  hasTrustee: boolean;             // האם יש כונס/נאמן
  trustees: TrusteeInfo[];         // רשימת כונסים/נאמנים
  procedures: LegalProcedure[];    // רשימת הליכים משפטיים
  relatedCompanies?: string[];     // חברות נוספות תחת אותו כונס
}

/**
 * מיפוי שם שדה מהמקור המקורי לשם סטנדרטי
 * @param record - רשומה מה-API
 * @param fieldVariations - רשימת וריאציות אפשריות לשם השדה
 * @returns הערך של השדה או undefined
 */
function getField(record: any, fieldVariations: string[]): any {
  for (const field of fieldVariations) {
    if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
      return record[field];
    }
  }
  return undefined;
}

/**
 * מיפוי רשומה מחברות בפירוק
 */
function mapLiquidationRecord(record: any): { trustee?: TrusteeInfo; procedure?: LegalProcedure; companyName?: string; fileId?: string } {
  const companyName = getField(record, ['שם החברה']);
  const fileId = getField(record, ['מזהה תיק פירוק חברה']);
  
  const procedure: LegalProcedure = {
    type: 'liquidation',
    fileNumber: fileId,
    openingDate: getField(record, ['תאריך קבלת צו פירוק', 'תאריך הגשת הבקשה']),
    closingDate: getField(record, ['תאריך סגירת תיק']),
    status: getField(record, ['סטטוס תיק']) || 'בפירוק',
  };

  return { trustee: undefined, procedure, companyName, fileId };
}

/**
 * מיפוי רשומה מחייבים בהליך פשיטת רגל
 */
function mapBankruptcyRecord(record: any): { trustee?: TrusteeInfo; procedure?: LegalProcedure } {
  const procedure: LegalProcedure = {
    type: 'bankruptcy',
    fileNumber: getField(record, ['מספר רץ תיקים']),
    openingDate: getField(record, ['תאריך פתיחת תיק']),
    closingDate: getField(record, ['תאריך גזירת תיק']),
    status: getField(record, ['סטטוס תיק']) || 'פשיטת רגל',
  };

  return { trustee: undefined, procedure };
}

/**
 * מיפוי רשומה מתביעות חוב
 * שדות זמינים: סוג תובע החוב, סטטוס תביעת חוב, סוג מערכת, תאריך יצירת החוב,
 * מזהה תיק, סכום תביעת החוב, סכום שאושר, סכום שאושר כתביעת חוב רגילה, סכום שאושר בדין קדימה
 */
function mapClaimRecord(record: any): { procedure?: LegalProcedure } {
  const procedure: LegalProcedure = {
    type: 'claim',
    fileNumber: getField(record, ['מזהה תיק'])?.toString(),
    status: getField(record, ['סטטוס תביעת חוב']) || 'לא ידוע',
    claimantType: getField(record, ['סוג תובע החוב']),
    systemType: getField(record, ['סוג מערכת']),
    debtCreationDate: getField(record, ['תאריך יצירת החוב']),
    amount: parseFloat(getField(record, ['סכום תביעת החוב']) || '0'),
    approvedAmount: parseFloat(getField(record, ['סכום שאושר']) || '0'),
    approvedRegularAmount: parseFloat(getField(record, ['סכום שאושר כתביעת חוב רגילה']) || '0'),
    approvedPriorityAmount: parseFloat(getField(record, ['סכום שאושר בדין קדימה']) || '0'),
  };

  return { procedure };
}

/**
 * חיפוש נתוני כונס/נאמן לפי מספר ח.פ
 * 
 * @param companyId - מספר ח.פ של החברה
 * @returns Promise עם נתוני הכונס/נאמן
 * 
 * תהליך:
 * 1. בדיקת cache
 * 2. טעינת נתונים ממאגר "חברות בפירוק"
 * 3. סינון לפי ח.פ
 * 4. מיפוי נתונים
 * 5. שמירה ב-cache
 */
export async function getTrusteeData(companyId: string): Promise<TrusteeData> {
  if (!companyId || companyId.trim().length === 0) {
    throw new Error('מספר ח.פ חסר');
  }

  const normalizedId = companyId.trim();

  // בדיקת cache
  const cacheKey = `trustee_${normalizedId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Trustee] Using cache for company ${normalizedId}`);
    return cached.data;
  }

  console.log(`[Trustee] Fetching data for company ${normalizedId}`);

  try {
    // שלב 1: חיפוש ראשוני בחברות בפירוק (חיפוש ישיר לפי ח.פ)
    const liquidationRecords = await searchRecords(
      RESOURCE_IDS.LIQUIDATED_COMPANIES, 
      normalizedId, 
      1000 // מספיק למצוא את החברה הספציפית
    );
    console.log(`[Trustee] Found ${liquidationRecords.length} liquidation records`);

    const matchingLiquidation = liquidationRecords.filter((r: any) => {
      const companyIdFromRecord = getField(r, ['מספר זיהוי של החברה']);
      return companyIdFromRecord && String(companyIdFromRecord).trim() === normalizedId;
    });

    console.log(`[Trustee] Found ${matchingLiquidation.length} liquidation records for company ${normalizedId}`);

    // איסוף מזהי תיק מרשומות הפירוק
    const fileIds = new Set<string>();
    matchingLiquidation.forEach((record: any) => {
      const fileId = getField(record, ['מזהה תיק פירוק חברה']);
      if (fileId) {
        fileIds.add(String(fileId));
      }
    });

    console.log(`[Trustee] Found ${fileIds.size} unique file IDs:`, Array.from(fileIds));

    // שלב 2 ו-3: אם יש מזהי תיק, חפש במאגרים האחרים במקביל
    let bankruptcyRecords: any[] = [];
    let claimRecords: any[] = [];

    if (fileIds.size > 0) {
      console.log(`[Trustee] Fetching bankruptcy and claim records...`);
      
      // חיפוש לפי מזהי תיק - עדיין צריך לשאוב הרבה כי אין חיפוש ישיר לפי file ID
      // TODO: אפשר לשפר עם חיפוש לפי כל file ID בנפרד
      const [allBankruptcy, allClaims] = await Promise.all([
        searchRecords(RESOURCE_IDS.BANKRUPTCY_DEBTORS, Array.from(fileIds)[0], 5000),
        searchRecords(RESOURCE_IDS.DEBT_CLAIMS, Array.from(fileIds)[0], 5000),
      ]);

      console.log(`[DataGov] Fetched ${allBankruptcy.length} bankruptcy records, ${allClaims.length} claim records`);

      // סינון לפי מזהה תיק
      bankruptcyRecords = allBankruptcy.filter((r: any) => {
        const fileId = getField(r, ['מספר רץ תיקים']);
        return fileId && fileIds.has(String(fileId));
      });

      claimRecords = allClaims.filter((r: any) => {
        const fileId = getField(r, ['מזהה תיק']);
        return fileId && fileIds.has(String(fileId));
      });

      console.log(`[Trustee] Matched ${bankruptcyRecords.length} bankruptcy records, ${claimRecords.length} claim records`);
    }

    // איסוף כל הנתונים
    const trusteesMap = new Map<string, TrusteeInfo>();
    const procedures: LegalProcedure[] = [];
    let companyName = '';

    // עיבוד רשומות פירוק
    matchingLiquidation.forEach((record: any) => {
      const mapped = mapLiquidationRecord(record);
      if (mapped.trustee) {
        trusteesMap.set(mapped.trustee.name, mapped.trustee);
      }
      if (mapped.procedure) {
        procedures.push(mapped.procedure);
      }
      if (mapped.companyName && !companyName) {
        companyName = mapped.companyName;
      }
    });

    // עיבוד רשומות פשיטת רגל
    bankruptcyRecords.forEach((record: any) => {
      const mapped = mapBankruptcyRecord(record);
      if (mapped.trustee) {
        trusteesMap.set(mapped.trustee.name, mapped.trustee);
      }
      if (mapped.procedure) {
        procedures.push(mapped.procedure);
      }
    });

    // עיבוד רשומות תביעות חוב
    claimRecords.forEach((record: any) => {
      const mapped = mapClaimRecord(record);
      if (mapped.procedure) {
        procedures.push(mapped.procedure);
      }
    });

    const trustees = Array.from(trusteesMap.values());
    
    // TODO: חיפוש חברות נוספות תחת אותו כונס (דורש חיפוש נוסף במאגרים)
    const relatedCompanies: string[] = [];

    const result: TrusteeData = {
      companyId: normalizedId,
      companyName: companyName || 'לא ידוע',
      hasTrustee: procedures.length > 0, // יש הליך פירוק = בעיה (גם בלי שם כונס)
      trustees,
      procedures,
      relatedCompanies,
    };

    // שמירה ב-cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    console.log(`[Trustee] Found ${trustees.length} trustees and ${procedures.length} procedures for company ${normalizedId}`);

    return result;

  } catch (error) {
    console.error('[Trustee] Error fetching trustee data:', error);
    throw error;
  }
}

/**
 * ניקוי cache
 * @param companyId - מספר ח.פ ספציפי (אופציונלי)
 */
export function clearTrusteeCache(companyId?: string): void {
  if (companyId) {
    cache.delete(`trustee_${companyId.trim()}`);
    console.log(`[Trustee] Cleared cache for company ${companyId}`);
  } else {
    cache.clear();
    console.log('[Trustee] Cleared all trustee cache');
  }
}

/**
 * סטטיסטיקות cache
 */
export function getTrusteeCacheStats() {
  return {
    entries: cache.size,
    companies: Array.from(cache.keys()).map(k => k.replace('trustee_', '')),
  };
}
