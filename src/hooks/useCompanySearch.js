import { useState, useCallback } from 'react';
import { searchCompany } from '../services/companyService';

/**
 * Custom hook for company search functionality
 * TODO: Add debouncing for search input
 * TODO: Add search history
 * TODO: Add caching mechanism
 */
export default function useCompanySearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  /**
   * Search for companies
   * @param {string} query - Search query
   */
  const search = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const data = await searchCompany(query);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to search companies');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setSelectedCompany(null);
  }, []);

  /**
   * Select a company from results
   * @param {Object} company - Company object
   */
  const selectCompany = useCallback((company) => {
    setSelectedCompany(company);
  }, []);

  return {
    loading,
    error,
    results,
    selectedCompany,
    search,
    clearResults,
    selectCompany,
  };
}
