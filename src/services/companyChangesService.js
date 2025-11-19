import { searchRecords } from './dataGovService';

/**
 * Company Changes Service
 * Handles fetching and filtering company change history from ICA data source
 */

const RESOURCE_ID = process.env.RESOURCE_ID_CHANGES;
const ENABLE_DEBUG = process.env.ENABLE_DEBUG_LOGS === 'true';

/**
 * Get company changes history by company number
 * @param {string} companyNumber - Company number (מספר חברה / מספר תאגיד)
 * @returns {Promise<Array>} Array of change records sorted by date
 */
export async function getCompanyChanges(companyNumber) {
  if (!companyNumber || String(companyNumber).trim().length === 0) {
    return [];
  }

  try {
    // Normalize company number for comparison
    const normalizedCompanyNumber = String(companyNumber).trim();

    // חיפוש ישיר לפי מספר חברה במקום שאיבת כל המאגר
    const allRecords = await searchRecords(RESOURCE_ID, normalizedCompanyNumber, 5000);
    
    if (allRecords.length === 0) {
      if (ENABLE_DEBUG) console.log('[CompanyChanges] No records found for company', normalizedCompanyNumber);
      return [];
    }

    // Log field names from first record for debugging
    if (allRecords.length > 0) {
      if (ENABLE_DEBUG) console.log('[CompanyChanges] Available fields:', Object.keys(allRecords[0]));
    }

    // סינון נוסף במידת הצורך (לפעמים החיפוש מחזיר יותר ממה שצריך)
    const filteredRecords = allRecords.filter(record => {
      // Try multiple field name variations
      const recordCompanyNumber = 
        record['מספר תאגיד'] ||
        record['מספר_תאגיד'] ||
        record['מספר_חברה'] || 
        record['מספר חברה'] ||
        record['מס_חברה'] ||
        record['מס חברה'] ||
        record['company_number'] ||
        record['corporation_number'] ||
        record._id ||
        '';

      return String(recordCompanyNumber).trim() === normalizedCompanyNumber;
    });

    if (ENABLE_DEBUG) console.log(`[CompanyChanges] Found ${filteredRecords.length} changes for company ${companyNumber}`);

    // Map to clean structure
    const changes = filteredRecords.map(record => {
      const date = 
        record['תאריך עדכון סטטוס'] ||
        record['תאריך_עדכון_סטטוס'] ||
        record['תאריך_שינוי'] ||
        record['תאריך שינוי'] ||
        record['שינוי_בתאריך'] || 
        record['שינוי בתאריך'] ||
        record['תאריך'] ||
        record['date'] ||
        '';
      
      const type = 
        record['סוג בקשה'] ||
        record['סוג_בקשה'] ||
        record['סוג_שינוי'] || 
        record['סוג שינוי'] ||
        record['סוג'] ||
        record['type'] ||
        '';
      
      const companyName = 
        record['שם תאגיד'] ||
        record['שם_תאגיד'] ||
        record['שם חברה'] ||
        record['שם_חברה'] ||
        '';
      
      const requestCode = 
        record['קוד סוג בקשה'] ||
        record['קוד_סוג_בקשה'] ||
        '';
      
      const securityId = 
        record['מזהה השיעבוד'] ||
        record['מזהה_השיעבוד'] ||
        null;

      // Build details string from available fields
      let details = '';
      if (companyName) details += companyName;
      if (requestCode) details += details ? ` (קוד: ${requestCode})` : `קוד: ${requestCode}`;
      if (securityId) details += details ? ` | מזהה שיעבוד: ${securityId}` : `מזהה שיעבוד: ${securityId}`;

      return {
        date,
        type,
        details: details || '',
        companyName,
        requestCode,
        securityId,
        _raw: record, // Keep full record for debugging
      };
    });

    // Sort by date (newest first)
    return changes.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      try {
        return new Date(b.date) - new Date(a.date);
      } catch {
        return 0;
      }
    });
  } catch (error) {
    console.error('[CompanyChanges] Error fetching company changes:', error);
    throw error;
  }
}
