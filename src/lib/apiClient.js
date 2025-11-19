/**
 * Frontend API Client for Company Data
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

/**
 * Fetch company trustee data from backend API
 * @param {string} companyId - Company number (ח.פ)
 * @returns {Promise<Object>} Trustee data with trustees, procedures, etc.
 */
export async function fetchCompanyTrustee(companyId) {
  if (!companyId) {
    throw new Error('Company ID is required');
  }

  try {
    const response = await fetch(`/api/company/${companyId}/trustee`);
    const data = await response.json();

    if (!response.ok) {
      console.warn('Failed to fetch trustee data, using empty result');
      return {
        companyId,
        companyName: 'לא ידוע',
        hasTrustee: false,
        trustees: [],
        procedures: [],
        relatedCompanies: [],
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching trustee data:', error);
    // Return empty result on error instead of throwing
    return {
      companyId,
      companyName: 'לא ידוע',
      hasTrustee: false,
      trustees: [],
      procedures: [],
      relatedCompanies: [],
    };
  }
}

