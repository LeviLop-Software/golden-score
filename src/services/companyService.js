import axios from 'axios';

/**
 * Company Service
 * Handles all company-related API calls
 * TODO: Configure base URL and API endpoints
 * TODO: Add error handling
 * TODO: Add authentication headers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Search for a company by name or ID
 * @param {string} query - Company name or identifier
 * @returns {Promise<Object>} Company data
 */
export async function searchCompany(query) {
  try {
    // TODO: Replace with actual API endpoint
    const response = await axios.get(`${API_BASE_URL}/companies/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching company:', error);
    throw error;
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
