'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * SearchBar Component
 * TODO: Implement company search functionality
 * TODO: Add validation
 * TODO: Connect to companyService
 */
export default function SearchBar({ onSearch }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement search logic
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search')}
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {t('search')}
      </button>
    </form>
  );
}
