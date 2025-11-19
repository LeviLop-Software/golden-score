import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for company search functionality with debouncing
 */
export default function useCompanySearch(debounceMs = 500) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const debounceTimerRef = useRef(null);

  /**
   * Search for companies
   * @param {string} searchQuery - Search query
   */
  const search = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/company/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search companies');
      }
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to search companies');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Debounced search effect
   */
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Skip search if query is empty
    if (!query || query.trim().length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      search(query);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs, search]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setQuery('');
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
    query,
    setQuery,
    loading,
    error,
    results,
    selectedCompany,
    search,
    clearResults,
    selectCompany,
  };
}
