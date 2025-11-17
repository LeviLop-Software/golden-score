import axios from 'axios';

/**
 * Data.gov.il Service
 * Handles fetching large datasets with pagination and caching
 */

const GOV_IL_API = 'https://data.gov.il/api/3/action/datastore_search';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// In-memory cache
const cache = new Map();

/**
 * Fetch all records from a data.gov.il resource with pagination
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

  console.log(`[DataGov] Fetching data for ${resourceId}...`);
  
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
