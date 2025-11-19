import axios from 'axios';

/**
 * Data.gov.il Service
 * Handles fetching large datasets with pagination and caching
 */

const GOV_IL_API = `${process.env.DATA_GOV_API_URL}/datastore_search`;
const CACHE_DURATION = parseInt(process.env.CACHE_TTL_DATA_GOV) * 1000;
const ENABLE_CACHE = process.env.ENABLE_CACHE !== 'false';
const ENABLE_DEBUG = process.env.ENABLE_DEBUG_LOGS === 'true';

// In-memory cache
const cache = new Map();

/**
 * Search records in a data.gov.il resource by query
 * אופטימיזציה: חיפוש ישיר במקום שאיבת כל המאגר
 * @param {string} resourceId - The data.gov.il resource ID
 * @param {string} query - Search query (e.g., company number)
 * @param {number} maxRecords - Maximum records to fetch (default: 1000)
 * @returns {Promise<Array>} Matching records
 */
export async function searchRecords(resourceId, query, maxRecords = 1000) {
  const cacheKey = `search_${resourceId}_${query}`;
  
  // Check cache
  if (ENABLE_CACHE) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (ENABLE_DEBUG) console.log(`[DataGov] Using cached search results for "${query}" (${cached.data.length} records)`);
      return cached.data;
    }
  }

  console.log(`[DataGov] Searching "${query}" in ${resourceId}...`);
  
  try {
    const allRecords = [];
    let offset = 0;
    const limit = Math.min(maxRecords, 32000); // Max limit per request
    let hasMore = true;

    while (hasMore && allRecords.length < maxRecords) {
      const params = {
        resource_id: resourceId,
        q: query, // חיפוש ישיר
        limit,
        offset,
      };

      console.log(`[DataGov] Search batch: offset=${offset}, limit=${limit}, query="${query}"`);
      const response = await axios.get(GOV_IL_API, { params });

      if (response.data?.success && response.data?.result?.records) {
        const records = response.data.result.records;
        allRecords.push(...records);
        
        console.log(`[DataGov] Found ${records.length} records (total: ${allRecords.length})`);
        
        // Check if there are more records
        const total = response.data.result.total || 0;
        hasMore = records.length === limit && allRecords.length < total && allRecords.length < maxRecords;
        offset += limit;
      } else {
        hasMore = false;
      }
    }

    console.log(`[DataGov] Search complete. Total matching records: ${allRecords.length}`);
    
    // Cache the results
    cache.set(cacheKey, {
      data: allRecords,
      timestamp: Date.now(),
    });

    return allRecords;
  } catch (error) {
    console.error(`[DataGov] Error searching resource ${resourceId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch all records from a data.gov.il resource with pagination
 * ⚠️ שימוש רק כשצריך את כל המאגר! מומלץ להשתמש ב-searchRecords במקום
 * @param {string} resourceId - The data.gov.il resource ID
 * @param {number} maxRecords - Maximum records to fetch (default: 100000)
 * @returns {Promise<Array>} All records from the resource
 */
export async function fetchAllRecords(resourceId, maxRecords = 100000) {
  const cacheKey = `resource_${resourceId}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[DataGov] Using cached data for ${resourceId} (${cached.data.length} records)`);
    return cached.data;
  }

  console.log(`[DataGov] ⚠️ Fetching ALL data for ${resourceId} (up to ${maxRecords} records)...`);
  console.log(`[DataGov] Consider using searchRecords() instead for better performance`);
  
  try {
    const allRecords = [];
    let offset = 0;
    const limit = 32000; // Max limit per request for data.gov.il
    let hasMore = true;

    while (hasMore && allRecords.length < maxRecords) {
      const params = {
        resource_id: resourceId,
        limit,
        offset,
      };

      console.log(`[DataGov] Fetching batch: offset=${offset}, limit=${limit}`);
      const response = await axios.get(GOV_IL_API, { params });

      if (response.data?.success && response.data?.result?.records) {
        const records = response.data.result.records;
        allRecords.push(...records);
        
        console.log(`[DataGov] Fetched ${records.length} records (total: ${allRecords.length})`);
        
        // Check if there are more records
        const total = response.data.result.total || 0;
        hasMore = records.length === limit && allRecords.length < total;
        offset += limit;

        // Safety check
        if (offset > maxRecords) {
          console.log(`[DataGov] Reached max records limit (${maxRecords})`);
          break;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`[DataGov] Finished fetching. Total records: ${allRecords.length}`);
    
    // Cache the results
    cache.set(cacheKey, {
      data: allRecords,
      timestamp: Date.now(),
    });

    return allRecords;
  } catch (error) {
    console.error(`[DataGov] Error fetching resource ${resourceId}:`, error.message);
    throw error;
  }
}

/**
 * Clear cache for a specific resource or all resources
 * @param {string} resourceId - Optional resource ID to clear specific cache
 */
export function clearCache(resourceId = null) {
  if (resourceId) {
    const cacheKey = `resource_${resourceId}`;
    cache.delete(cacheKey);
    console.log(`[DataGov] Cleared cache for ${resourceId}`);
  } else {
    cache.clear();
    console.log('[DataGov] Cleared all cache');
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
export function getCacheStats() {
  const stats = {
    entries: cache.size,
    resources: [],
  };

  cache.forEach((value, key) => {
    stats.resources.push({
      key,
      records: value.data.length,
      age: Math.floor((Date.now() - value.timestamp) / 1000 / 60), // minutes
    });
  });

  return stats;
}
