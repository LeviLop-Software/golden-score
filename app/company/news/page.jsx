'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, ExternalLink, FileText, Newspaper, RefreshCw, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

/**
 * Full News Page Component
 * Displays all news with pagination
 */
function NewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyName = searchParams.get('name');
  const companyNumber = searchParams.get('companyNumber');
  const taseId = searchParams.get('taseId');
  
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!companyName) {
      setError('שם החברה חסר');
      setLoading(false);
      return;
    }
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

      console.log(`[NewsPage] Fetching news with params:`, params.toString());

      const response = await fetch(`/api/company/news?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      console.log(`[NewsPage] Received ${data.news?.length || 0} news items`);
      setNews(data.news || []);
    } catch (err) {
      console.error('[NewsPage] Error fetching news:', err);
      setError('שגיאה בטעינת חדשות');
    } finally {
      setLoading(false);
    }
  };

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

  // Filter news
  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.type === filter);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (!companyName) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4" dir="rtl">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">שם החברה חסר</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזרה לחיפוש
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors mb-4"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">חדשות על {companyName}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredNews.length} {filter === 'all' ? 'חדשות' : filter === 'official' ? 'דוחות רשמיים' : 'חדשות'} נמצאו
                  </p>
                </div>
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
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={fetchNews} />
          ) : filteredNews.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              {/* News List */}
              <div className="space-y-4 mb-6">
                {currentNews.map((item, index) => (
                  <NewsCard 
                    key={startIndex + index} 
                    item={item} 
                    formatDate={formatDate}
                    index={startIndex + index + 1}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    מציג {startIndex + 1}-{Math.min(endIndex, filteredNews.length)} מתוך {filteredNews.length}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (Math.abs(pageNum - currentPage) === 2) {
                          return <span key={pageNum} className="text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * News Card Component
 */
function NewsCard({ item, formatDate, index }) {
  const isOfficial = item.type === 'official';
  
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
      className="block p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Index Number */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
          {index}
        </div>

        {/* Icon */}
        <div className={`mt-1 ${isOfficial ? 'text-purple-600' : 'text-blue-600'}`}>
          {isOfficial ? (
            <FileText className="w-6 h-6" />
          ) : (
            <Newspaper className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-2">
            {item.title}
          </h3>

          {/* Snippet */}
          {item.snippet && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {item.snippet}
            </p>
          )}

          {/* Meta - Source + Date */}
          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold border ${getSourceStyle()}`}>
              {item.source}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(item.date)}
            </span>
            {item.reportType && (
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md font-medium">
                {item.reportType}
              </span>
            )}
          </div>
        </div>

        {/* External Link Icon */}
        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0 mt-1" />
      </div>
    </a>
  );
}

/**
 * Loading State
 */
function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="p-5 rounded-lg border border-gray-200">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
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
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <Newspaper className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        לא ניתן לטעון חדשות
      </h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Newspaper className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
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

/**
 * Main export with Suspense wrapper
 */
export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">טוען חדשות...</p>
        </div>
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  );
}
