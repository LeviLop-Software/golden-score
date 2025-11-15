import axios from 'axios';

/**
 * Company Service
 * Handles all company-related API calls
 */

const GOV_IL_API = 'https://data.gov.il/api/3/action/datastore_search';
const RESOURCE_ID = 'f004176c-b85f-4542-8901-7b3176f9a054';

/**
 * Search for companies using data.gov.il API
 * @param {string} query - Company name or identifier
 * @returns {Promise<Array>} Array of company records with id and name
 */
export async function searchCompanies(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await axios.get(GOV_IL_API, {
      params: {
        resource_id: RESOURCE_ID,
        q: query,
        limit: 20,
      },
    });

    if (response.data?.success && response.data?.result?.records) {
      // Map to clean structure with only needed fields
      return response.data.result.records.map(record => ({
        id: record['מספר_רישום'] || record.registration_number || record._id,
        name: record['שם_חברה'] || record.corporation_name || 'N/A',
        registrationNumber: record['מספר_רישום'] || record.registration_number,
        corporationName: record['שם_חברה'] || record.corporation_name,
        status: record['סטטוס_תאגיד'] || record.corporation_status,
        type: record['סוג_תאגיד'] || record.corporation_type,
        // Keep full record for detailed view
        _raw: record,
      }));
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
