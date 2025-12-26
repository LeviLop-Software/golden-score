'use client';

import { useState, useEffect } from 'react';
import { Loader2, HelpCircle } from 'lucide-react';

/**
 * IndustryBadge Component
 * Displays the industry classification for a company
 */
export default function IndustryBadge({ companyId, companyName, companyData, news = [] }) {
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (companyId && !hasFetched) {
      setHasFetched(true);
      fetchClassification();
    }
  }, [companyId, hasFetched]);

  // Fetch news for the company
  const fetchNews = async () => {
    try {
      const name = companyName || companyData?.name || '';
      if (!name) return [];
      
      const response = await fetch(`/api/company/news?companyName=${encodeURIComponent(name)}&companyNumber=${companyId || ''}`);
      if (response.ok) {
        const data = await response.json();
        // API returns { success, count, news }
        if (data.success && Array.isArray(data.news) && data.news.length > 0) {
          return data.news.slice(0, 5).map(item => item.title || item.headline || item.description || '').filter(Boolean);
        }
      }
    } catch (err) {
      console.error('Error fetching news for classification:', err);
    }
    return [];
  };

  const fetchClassification = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract data from _raw if available
      const raw = companyData?._raw || {};
      
      console.log('IndustryBadge - companyData:', companyData);
      console.log('IndustryBadge - raw data:', raw);
      
      // Fetch news if not provided
      let newsHeadlines = news;
      if (!newsHeadlines || newsHeadlines.length === 0) {
        console.log('IndustryBadge - Fetching news...');
        newsHeadlines = await fetchNews();
        console.log('IndustryBadge - Fetched news:', newsHeadlines);
      }
      
      const requestData = {
        name: companyName || companyData?.name || '',
        englishName: raw['שם באנגלית'] || '',
        purpose: raw['מטרת החברה'] || '',
        city: raw['שם עיר'] || '',
        news: newsHeadlines
      };
      
      console.log('IndustryBadge - Request data:', requestData);
      
      const response = await fetch(`/api/classify/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setClassification(data.classification);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('שגיאה בטעינת הסיווג');
    } finally {
      setLoading(false);
    }
  };

  // Color mapping for industries
  const getIndustryColor = (industry) => {
    const colors = {
      technology: 'bg-purple-100 text-purple-800 border-purple-300',
      banking_finance: 'bg-green-100 text-green-800 border-green-300',
      real_estate: 'bg-orange-100 text-orange-800 border-orange-300',
      healthcare: 'bg-red-100 text-red-800 border-red-300',
      manufacturing: 'bg-gray-100 text-gray-800 border-gray-300',
      retail: 'bg-pink-100 text-pink-800 border-pink-300',
      food_beverage: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      construction: 'bg-amber-100 text-amber-800 border-amber-300',
      transportation: 'bg-blue-100 text-blue-800 border-blue-300',
      energy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      education: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      legal_services: 'bg-slate-100 text-slate-800 border-slate-300',
      consulting: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      media_marketing: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
      tourism: 'bg-teal-100 text-teal-800 border-teal-300',
      general: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[industry] || colors.general;
  };

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded-full">
        <Loader2 size={14} className="animate-spin" />
        מסווג...
      </span>
    );
  }

  if (error || !classification) {
    return null;
  }

  const { industry, display, confidence, reasoning, source } = classification;
  
  // Don't show badge for unclassified (general with low confidence)
  if (industry === 'general' && confidence < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-50 text-gray-400 rounded-full border border-gray-200">
        אין סיווג
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border transition-all hover:shadow-sm ${getIndustryColor(industry)}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {display?.he || industry}
        <HelpCircle size={12} className="opacity-60" />
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{display?.he}</span>
              <span className="text-xs text-gray-400">
                {Math.round(confidence * 100)}% ביטחון
              </span>
            </div>
            {reasoning && (
              <p className="text-gray-300 text-xs leading-relaxed">
                {reasoning}
              </p>
            )}
            <div className="text-xs text-gray-500 pt-1 border-t border-gray-700">
              מקור: {source === 'ai_classification' ? 'AI' : source}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full right-4 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
