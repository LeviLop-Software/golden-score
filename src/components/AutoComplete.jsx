'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { searchCompanies } from '../services/companyService';

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
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

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
        const data = await searchCompanies(query);
        setResults(Array.isArray(data) ? data : []);
        setShowDropdown(data.length > 0);
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
    setQuery(company.name);
    setShowDropdown(false);
    if (onSelect) {
      onSelect(company);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleInputFocus = () => {
    if (query.trim().length >= 2 && results.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={t('search') + ' (לפחות 2 תווים)'}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
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
          ref={dropdownRef}
          className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md z-50 max-h-96 overflow-y-auto"
        >
          {results.map((company, index) => (
            <div
              key={company.id || index}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSelect(company);
              }}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-gray-900">
                {company.name || company.corporationName}
              </div>
              {company.registrationNumber && (
                <div className="text-sm text-gray-600 mt-1">
                  ח"פ: {company.registrationNumber}
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
