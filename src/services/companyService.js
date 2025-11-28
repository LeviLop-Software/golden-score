import axios from 'axios';

/**
 * Company Service
 * Handles all company-related API calls
 */

const GOV_IL_API = 'https://data.gov.il/api/3/action/datastore_search';
const RESOURCE_ID = process.env.RESOURCE_ID_COMPANIES;
const ENABLE_DEBUG = process.env.ENABLE_DEBUG_LOGS === 'true';

/**
 * Search for companies using data.gov.il API
 * Supports search by company name or registration number (ח"פ)
 * @param {string} query - Company name or registration number
 * @returns {Promise<Array>} Array of company records with id and name
 */
export async function searchCompanies(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Check if query is a number (registration number search)
    const isRegistrationNumber = /^\d+$/.test(query.trim());
    
    // Build search parameters
    const params = {
      resource_id: RESOURCE_ID,
      limit: 20,
    };

    // If it's a registration number, search specifically in that field
    // Otherwise do a general text search
    if (isRegistrationNumber) {
      // Try multiple possible field names for registration number
      // Use general search with the number - API will search across all fields
      params.q = query.trim();
    } else {
      // General text search
      params.q = query;
    }

    const response = await axios.get(GOV_IL_API, { params });

    const data = response.data;

    if (data?.success && data?.result?.records) {
      const records = data.result.records;
      
      // Log first record to see actual field names
      if (ENABLE_DEBUG && records.length > 0) {
        console.log('=== API Response Debug ===');
        console.log('Total records:', records.length);
        console.log('Sample record fields:', Object.keys(records[0]));
        console.log('Sample record:', records[0]);
        console.log('=========================');
      }

      // Map to clean structure with all possible field name variations
      return records.map(record => {
        
        // Company Number (ח"פ) - the main identifier
        const companyNumber = 
          record['מספר_חברה'] || 
          record['מס_חברה'] ||
          record['מספר חברה'] ||
          record['corporation_number'] || 
          record.מספר_חברה ||
          record._id ||
          '';
        
        // Registration Number (מספר רישום) - different from ח"פ
        const registrationNumber = 
          record['מספר_רישום'] || 
          record['מס_רישום'] ||
          record['מספר רישום'] ||
          record['registration_number'] || 
          record.מספר_רישום ||
          '';
        
        const corporationName = 
          record['שם_חברה'] || 
          record['שם_תאגיד'] ||
          record.corporation_name || 
          record.שם_חברה ||
          record['שם חברה'] ||
          record.name ||
          'לא ידוע';
        
        const status = 
          record['סטטוס_תאגיד'] || 
          record['סטטוס'] ||
          record.corporation_status || 
          record.status ||
          '';
        
        const type = 
          record['סוג_תאגיד'] || 
          record['סוג'] ||
          record.corporation_type || 
          record.type ||
          '';

        return {
          id: companyNumber || registrationNumber || `temp-${Date.now()}-${Math.random()}`,
          name: corporationName,
          companyNumber,
          registrationNumber,
          corporationName,
          status,
          type,
          // Keep full record for detailed view
          _raw: record,
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
}

/**
 * Get company details by ID
 * @param {string} companyId - Company identifier
 * @returns {Promise<Object>} Company details
 */
export async function getCompanyById(companyId) {
  try {
    // TODO: Replace with actual API endpoint
    const response = await axios.get(`${API_BASE_URL}/companies/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
}

/**
 * Get company score and metrics
 * @param {string} companyId - Company identifier
 * @returns {Promise<Object>} Company score data
 */
export async function getCompanyScore(companyId) {
  try {
    // TODO: Replace with actual API endpoint
    const response = await axios.get(`${API_BASE_URL}/companies/${companyId}/score`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company score:', error);
    throw error;
  }
}

/**
 * Get list of all companies
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of companies
 */
export async function getCompanies(filters = {}) {
  try {
    // TODO: Replace with actual API endpoint
    const response = await axios.get(`${API_BASE_URL}/companies`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}
