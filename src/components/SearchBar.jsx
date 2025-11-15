'use client';

import { useTranslation } from 'react-i18next';
import useCompanySearch from '../hooks/useCompanySearch';
import CompanyCard from './CompanyCard';

/**
 * SearchBar Component with integrated search results
 */
export default function SearchBar() {
  const { t } = useTranslation();
  const { query, setQuery, loading, error, results, clearResults } = useCompanySearch();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search')}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        {query && (
          <button
            type="button"
            onClick={clearResults}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('clear') || 'נקה'}
          </button>
        )}
      </form>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">{t('error')}</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('results')}: {results.length}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((company, index) => (
              <CompanyCard key={company.id || index} company={company} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && query && results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
