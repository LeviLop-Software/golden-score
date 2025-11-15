import axios from 'axios';
import sampleCompany from '../mock/sample-company.json';

/**
 * Company Service
 * Handles all company-related API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const GOV_IL_API = 'https://data.gov.il/api/3/action/datastore_search';
const RESOURCE_ID = 'f004176c-b85f-4542-8901-7b3176f9a054';

/**
 * Search for companies using data.gov.il API
 * @param {string} query - Company name or identifier
 * @returns {Promise<Array>} Array of company records
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
      return response.data.result.records;
    }

    // Fallback to mock data if API response is invalid
    console.warn('Invalid API response, using mock data');
    return [sampleCompany];
  } catch (error) {
    console.error('Error searching companies:', error);
    // Fallback to mock data on error
    return [sampleCompany];
  }
}

/**
 * Search for a company by name or ID (legacy function)
 * @param {string} query - Company name or identifier
 * @returns {Promise<Object>} Company data
 */
export async function searchCompany(query) {
  const results = await searchCompanies(query);
  return results[0] || null;
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
