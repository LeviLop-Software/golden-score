'use client';

import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, FileText, Newspaper, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * CompanyNews Component
 * Displays news and reports for a company from multiple sources
 * Shows only 3 latest items with "View All" link
 */
export default function CompanyNews({ companyName, companyNumber, taseId, className = '', limit = 3 }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, official, news

  useEffect(() => {
    fetchNews();
  }, [companyName, companyNumber, taseId]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        companyName,
        ...(companyNumber && { companyNumber }),
        ...(taseId && { taseId }),
      });

      console.log(`[CompanyNews] Fetching news with params:`, params.toString());

      const response = await fetch(`/api/company/news?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      console.log(`[CompanyNews] Received ${data.news?.length || 0} news items`);
      setNews(data.news || []);
    } catch (err) {
      console.error('[CompanyNews] Error fetching news:', err);
      setError('שגיאה בטעינת חדשות');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.type === filter);

  // Limit items for preview mode
  const displayedNews = limit ? filteredNews.slice(0, limit) : filteredNews;
  const hasMore = limit && filteredNews.length > limit;

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    
    return d.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">חדשות על החברה</h2>
          </div>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="רענן חדשות"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            הכל ({news.length})
          </button>
          <button
            onClick={() => setFilter('official')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'official'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            דוחות רשמיים ({news.filter(n => n.type === 'official').length})
          </button>
          <button
            onClick={() => setFilter('news')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'news'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            חדשות ({news.filter(n => n.type === 'news').length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <LoadingState count={limit || 5} />
        ) : error ? (
          <ErrorState error={error} onRetry={fetchNews} />
        ) : filteredNews.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            <div className="space-y-4">
              {displayedNews.map((item, index) => (
                <NewsCard key={index} item={item} formatDate={formatDate} />
              ))}
            </div>
            
            {/* View All Button */}
            {hasMore && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <Link
                  href={`/company/news?name=${encodeURIComponent(companyName)}${companyNumber ? `&companyNumber=${companyNumber}` : ''}${taseId ? `&taseId=${taseId}` : ''}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Newspaper className="w-5 h-5" />
                  ראה את כל החדשות ({filteredNews.length})
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <p className="text-sm text-gray-500 mt-2">
                  מציג {displayedNews.length} מתוך {filteredNews.length} חדשות
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * News Card Component
 */
function NewsCard({ item, formatDate }) {
  const isOfficial = item.type === 'official';
  
  // Get source badge color
  const getSourceStyle = () => {
    if (item.source === 'Google News') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (item.source === 'Globes') return 'bg-green-100 text-green-700 border-green-300';
    if (item.source === 'Ynet') return 'bg-red-100 text-red-700 border-red-300';
    if (item.source === 'Calcalist') return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-1 ${isOfficial ? 'text-purple-600' : 'text-blue-600'}`}>
          {isOfficial ? (
            <FileText className="w-5 h-5" />
          ) : (
            <Newspaper className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 mb-1 line-clamp-2">
            {item.title}
          </h3>

          {/* Snippet */}
          {item.snippet && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {item.snippet}
            </p>
          )}

          {/* Meta - Source + Date */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium border ${getSourceStyle()}`}>
              {item.source}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(item.date)}
            </span>
            {item.reportType && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                {item.reportType}
              </span>
            )}
          </div>
        </div>

        {/* External Link Icon */}
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 mt-1" />
      </div>
    </a>
  );
}

/**
 * Loading State
 */
function LoadingState({ count = 5 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Error State
 */
function ErrorState({ error, onRetry }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <Newspaper className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        לא ניתן לטעון חדשות
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        נסה שוב
      </button>
    </div>
  );
}

/**
 * Empty State
 */
function EmptyState({ filter }) {
  const messages = {
    all: 'לא נמצאו חדשות עבור חברה זו',
    official: 'לא נמצאו דוחות רשמיים',
    news: 'לא נמצאו חדשות',
  };

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
        <Newspaper className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {messages[filter] || messages.all}
      </h3>
      <p className="text-gray-600">
        {filter === 'all' 
          ? 'נסה לחפש חברה אחרת או חזור מאוחר יותר'
          : 'נסה לשנות את הסינון'}
      </p>
    </div>
  );
}
