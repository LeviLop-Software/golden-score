'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * AutoComplete Component
 * Search with dropdown suggestions
 */
export default function AutoComplete({ onSelect }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const wasInputFocusedRef = useRef(false);

  // Keep track of input focus
  useLayoutEffect(() => {
    if (wasInputFocusedRef.current && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Skip search if query is too short
    if (!query || query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    // Set loading state immediately for better UX
    setLoading(true);

    // Set new timer for debounced search (300ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setError(null);
        const response = await fetch(`/api/company/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Failed to search companies');
        }
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
        // Show dropdown only if we have results
        if (data.length > 0) {
          setShowDropdown(true);
        }
      } catch (err) {
        setError(err.message || 'שגיאה בחיפוש');
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleSelect = (company) => {
    // Close dropdown and clear results immediately
    setShowDropdown(false);
    setResults([]);
    setQuery('');
    
    // Call parent callback
    if (onSelect) {
      onSelect(company);
    }
    
    // Navigate to company page
    window.location.href = `/company/${company.companyNumber || company.id}`;
  };

  const handleInputChange = (e) => {
    wasInputFocusedRef.current = true;
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    wasInputFocusedRef.current = true;
  };

  const handleInputBlur = () => {
    wasInputFocusedRef.current = false;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={t('search') + ' (שם או ח"פ - לפחות 2 תווים)'}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div 
          className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-50 max-h-96 overflow-y-auto"
          onMouseDown={(e) => {
            // Prevent dropdown from stealing focus from input
            e.preventDefault();
          }}
        >
          {results.map((company, index) => (
            <div
              key={company.id || index}
              onMouseDown={(e) => {
                // Prevent focus loss on click
                e.preventDefault();
              }}
              onClick={() => handleSelect(company)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-gray-900">
                {company.name || company.corporationName}
              </div>
              {company.companyNumber && (
                <div className="text-sm text-gray-600 mt-1">
                  ח"פ: {company.companyNumber}
                </div>
              )}
              {company.type && (
                <div className="text-xs text-gray-500 mt-1">
                  {company.type}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showDropdown && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-50 p-4 text-center text-gray-500">
          {t('noResults')}
        </div>
      )}
    </div>
  );
}
