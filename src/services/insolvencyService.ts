/**
 * Insolvency API Client (TypeScript)
 * Fetches insolvency case data from Israeli Ministry of Justice API
 */

const JUSTICE_API_URL = process.env.JUSTICE_API_URL!;
const CACHE_DURATION = parseInt(process.env.CACHE_TTL_JUSTICE!) * 1000;
const ENABLE_CACHE = process.env.ENABLE_CACHE !== 'false';
const ENABLE_DEBUG = process.env.ENABLE_DEBUG_LOGS === 'true';

interface InsolvencyOrder {
  orderType: string;
  date: string | null;
  details?: string;
}

interface InsolvencyTrustee {
  name: string;
  appointmentDate: string | null;
}

interface InsolvencyCase {
  proceedingId: number;
  debtorName: string;
  status: string;
  type: string;
  openingDate: string | null;
  courtFileNumber: string | null;
  orders: InsolvencyOrder[];
  trustees: InsolvencyTrustee[];
}

interface InsolvencyResponse {
  caseCount: number;
  cases: InsolvencyCase[];
}

interface ExternalCase {
  ProceedingId?: number;
  proceedingId?: number;
  DebtorName?: string;
  debtorName?: string;
  Status?: string;
  status?: string;
  Type?: string;
  type?: string;
  ProceedingType?: string;
  proceedingType?: string;
  OpeningDate?: string;
  openingDate?: string;
  CourtFileNumber?: string;
  courtFileNumber?: string;
  Orders?: any[];
  orders?: any[];
  Trustees?: any[];
  trustees?: any[];
  [key: string]: any;
}

// In-memory cache
interface CacheEntry {
  data: InsolvencyResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Normalize a date string to ISO format or return null
 */
function normalizeDate(dateValue: any): string | null {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Map external API order format to internal format
 */
function mapOrder(externalOrder: any): InsolvencyOrder {
  return {
    orderType: externalOrder?.OrderType || externalOrder?.orderType || externalOrder?.type || '',
    date: normalizeDate(externalOrder?.OrderDate || externalOrder?.orderDate || externalOrder?.date),
    details: externalOrder?.Details || externalOrder?.details || undefined,
  };
}

/**
 * Map external API trustee format to internal format
 */
function mapTrustee(externalTrustee: any): InsolvencyTrustee {
  return {
    name: externalTrustee?.Name || externalTrustee?.name || externalTrustee?.TrusteeName || '',
    appointmentDate: normalizeDate(
      externalTrustee?.AppointmentDate || externalTrustee?.appointmentDate || externalTrustee?.date
    ),
  };
}

/**
 * Map external API case format to internal format
 */
function mapCase(externalCase: ExternalCase): InsolvencyCase {
  const proceedingId = externalCase.ProceedingId || externalCase.proceedingId || 0;
  const debtorName = externalCase.DebtorName || externalCase.debtorName || '';
  const status = externalCase.Status || externalCase.status || '';
  const type = externalCase.Type || externalCase.type || externalCase.ProceedingType || externalCase.proceedingType || '';
  const openingDate = normalizeDate(externalCase.OpeningDate || externalCase.openingDate);
  const courtFileNumber = externalCase.CourtFileNumber || externalCase.courtFileNumber || null;
  
  const ordersArray = externalCase.Orders || externalCase.orders || [];
  const trusteesArray = externalCase.Trustees || externalCase.trustees || [];
  
  return {
    proceedingId,
    debtorName,
    status,
    type,
    openingDate,
    courtFileNumber,
    orders: Array.isArray(ordersArray) ? ordersArray.map(mapOrder) : [],
    trustees: Array.isArray(trusteesArray) ? trusteesArray.map(mapTrustee) : [],
  };
}

/**
 * Fetch insolvency cases for a debtor from the Ministry of Justice API
 * @param debtorNumber - Israeli company/person ID number
 * @returns Promise with case count and array of cases
 */
export async function getInsolvencyCases(debtorNumber: string): Promise<InsolvencyResponse> {
  // Validate input
  if (!debtorNumber || typeof debtorNumber !== 'string' || debtorNumber.trim().length === 0) {
    throw new Error('Invalid debtor number: must be a non-empty string');
  }

  const normalizedDebtorNumber = debtorNumber.trim();

  // Validate numeric
  if (!/^\d+$/.test(normalizedDebtorNumber)) {
    throw new Error('Invalid debtor number: must contain only digits');
  }

  // Check cache
  if (ENABLE_CACHE) {
    const cached = cache.get(normalizedDebtorNumber);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (ENABLE_DEBUG) console.log(`[Insolvency] Cache hit for debtor ${normalizedDebtorNumber}`);
      return cached.data;
    }
  }

  if (ENABLE_DEBUG) console.log(`[Insolvency] Fetching data for debtor ${normalizedDebtorNumber}`);

  try {
    // Call the API
    const response = await fetch(JUSTICE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        DebtorNumber: normalizedDebtorNumber,
        page: 1,
        pageSize: 200,
      }),
    });

    if (!response.ok) {
      // If 404 or 403, assume no cases found
      if (response.status === 404 || response.status === 403) {
        const emptyResult = { caseCount: 0, cases: [] };
        cache.set(normalizedDebtorNumber, { data: emptyResult, timestamp: Date.now() });
        return emptyResult;
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Parse response - handle different response structures
    let casesArray: ExternalCase[] = [];

    if (Array.isArray(data)) {
      casesArray = data;
    } else if (data && Array.isArray(data.results)) {
      casesArray = data.results;
    } else if (data && Array.isArray(data.data)) {
      casesArray = data.data;
    } else if (data && Array.isArray(data.cases)) {
      casesArray = data.cases;
    } else if (data && typeof data === 'object') {
      // Try to find an array property
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) {
        casesArray = data[arrayKey];
      }
    }

    // If no cases found, return empty result
    if (casesArray.length === 0) {
      const emptyResult = { caseCount: 0, cases: [] };
      cache.set(normalizedDebtorNumber, { data: emptyResult, timestamp: Date.now() });
      return emptyResult;
    }

    // Map cases to internal format
    const mappedCases = casesArray.map(mapCase);

    // Sort by opening date descending (newest first)
    mappedCases.sort((a, b) => {
      if (!a.openingDate && !b.openingDate) return 0;
      if (!a.openingDate) return 1;
      if (!b.openingDate) return -1;
      return new Date(b.openingDate).getTime() - new Date(a.openingDate).getTime();
    });

    const result: InsolvencyResponse = {
      caseCount: mappedCases.length,
      cases: mappedCases,
    };

    // Cache the result
    if (ENABLE_CACHE) {
      cache.set(normalizedDebtorNumber, { data: result, timestamp: Date.now() });
    }

    if (ENABLE_DEBUG) console.log(`[Insolvency] Found ${result.caseCount} cases for debtor ${normalizedDebtorNumber}`);

    return result;

  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[Insolvency] Network error or CORS issue');
      return { caseCount: 0, cases: [] };
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Clear cache for a specific debtor or all cache
 */
export function clearInsolvencyCache(debtorNumber?: string): void {
  if (debtorNumber) {
    cache.delete(debtorNumber.trim());
    console.log(`[Insolvency] Cleared cache for debtor ${debtorNumber}`);
  } else {
    cache.clear();
    console.log('[Insolvency] Cleared all cache');
  }
}

/**
 * Get cache statistics
 */
export function getInsolvencyCacheStats() {
  return {
    entries: cache.size,
    debtors: Array.from(cache.keys()),
  };
}
