/**
 * Frontend API Client for Company Changes
 * Wrapper for calling backend API endpoints
 */

/**
 * Fetch company changes from backend API
 * @param {string} companyId - Company number
 * @returns {Promise<Array>} Array of change records
 */
export async function fetchCompanyChanges(companyId) {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    const response = await fetch(`/api/company/${companyId}/changes`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch company changes');
    }

    return data.changes || [];
  } catch (error) {
    console.error('Error fetching company changes:', error);
    throw error;
  }
}
