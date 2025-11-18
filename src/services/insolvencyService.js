/**
 * Insolvency Service
 * Handles fetching insolvency (חדלות פירעון) data from Justice Ministry API
 */

const JUSTICE_API = 'https://api.justice.gov.il/InsolvencyPublicData/GetData';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// In-memory cache
const cache = new Map();

/**
 * Fetch insolvency data for a company from Justice Ministry API
 * Note: This should be called from client-side due to CORS restrictions
 * @param {string} companyId - Company number (debtor number)
 * @returns {Promise<Object>} Insolvency data with case count and cases
 */
export async function fetchInsolvencyData(companyId) {
  if (!companyId || String(companyId).trim().length === 0) {
    return { caseCount: 0, cases: [] };
  }

  // Validate company ID is numeric
  const numericId = String(companyId).trim();
  if (!/^\d+$/.test(numericId)) {
    throw new Error('Company ID must be numeric');
  }

  // Check cache
  const cacheKey = `insolvency_company_${numericId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Insolvency] Using cached data for company ${numericId}`);
    return cached.data;
  }

  console.log(`[Insolvency] Fetching data for company ${numericId}...`);

  try {
    // Use native fetch instead of axios for better browser compatibility
    const response = await fetch(JUSTICE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        DebtorNumber: numericId,
        page: 1,
        pageSize: 100,
      }),
    });

    if (!response.ok) {
      console.error(`[Insolvency] API returned status ${response.status}`);
      
      // If 403/404, return empty result (no data available)
      if (response.status === 403 || response.status === 404) {
        return { caseCount: 0, cases: [] };
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    console.log('[Insolvency] Raw response:', JSON.stringify(data).substring(0, 200));

    // Handle different response structures
    let cases = [];
    let caseCount = 0;

    if (data && Array.isArray(data)) {
      // If response is an array
      cases = data;
      caseCount = data.length;
    } else if (data && data.results && Array.isArray(data.results)) {
      // If response has results property
      cases = data.results;
      caseCount = data.totalCount || data.results.length;
    } else if (data && data.data && Array.isArray(data.data)) {
      // If response has data property
      cases = data.data;
      caseCount = data.count || data.data.length;
    } else if (data && typeof data === 'object') {
      // Try to find array in response
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) {
        cases = data[arrayKey];
        caseCount = data.totalCount || data.count || cases.length;
      }
    }

    // Map cases to clean structure
    const mappedCases = cases.map(caseData => ({
      proceedingId: 
        caseData.proceedingId || 
        caseData.ProceedingId ||
        caseData.proceeding_id ||
        caseData.id ||
        caseData._id ||
        '',
      type: 
        caseData.type || 
        caseData.Type ||
        caseData.proceedingType ||
        caseData.ProceedingType ||
        '',
      status: 
        caseData.status || 
        caseData.Status ||
        caseData.proceedingStatus ||
        caseData.ProceedingStatus ||
        '',
      openingDate: 
        caseData.openingDate || 
        caseData.OpeningDate ||
        caseData.opening_date ||
        caseData.dateOpened ||
        '',
      trustees: 
        caseData.trustees || 
        caseData.Trustees ||
        caseData.trusteesList ||
        [],
      orders: 
        caseData.orders || 
        caseData.Orders ||
        caseData.ordersList ||
        [],
      _raw: caseData, // Keep full record for debugging
    }));

    const result = {
      caseCount,
      cases: mappedCases,
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    console.log(`[Insolvency] Found ${caseCount} cases for company ${numericId}`);

    return result;

  } catch (error) {
    // Handle API errors gracefully
    console.error('[Insolvency] Error:', error);
    
    // For CORS or network errors, return empty result
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[Insolvency] Network error or CORS issue');
      return { caseCount: 0, cases: [] };
    }
    
    // For other errors, return empty result gracefully
    return { caseCount: 0, cases: [] };
  }
}

/**
 * Clear cache for a specific company or all companies
 * @param {string} companyId - Optional company ID to clear specific cache
 */
export function clearInsolvencyCache(companyId = null) {
  if (companyId) {
    const cacheKey = `insolvency_company_${companyId}`;
    cache.delete(cacheKey);
    console.log(`[Insolvency] Cleared cache for company ${companyId}`);
  } else {
    cache.clear();
    console.log('[Insolvency] Cleared all insolvency cache');
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getInsolvencyCacheStats() {
  const stats = {
    entries: cache.size,
    companies: [],
  };

  cache.forEach((value, key) => {
    const companyId = key.replace('insolvency_company_', '');
    stats.companies.push({
      companyId,
      caseCount: value.data.caseCount,
      age: Math.floor((Date.now() - value.timestamp) / 1000 / 60), // minutes
    });
  });

  return stats;
}
