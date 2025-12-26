'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, ChevronDown, Copy, Check } from 'lucide-react';
import IndustryBadge from './IndustryBadge';
// import { exportCompanyPdf } from '../lib/pdf'; // TODO: Enable when Hebrew font support is added

/**
 * CompanyCard Component
 * Display comprehensive company information from gov.il data
 */
export default function CompanyCard({ company }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!company) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(company.companyNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  // Calculate a mock score (0-100) based on available data
  // TODO: Replace with actual scoring algorithm
  const calculateScore = () => {
    let score = 50;
    if (company.status?.includes('פעיל') || company.status?.includes('רשום')) score += 30;
    if (company.registrationNumber) score += 10;
    if (company.type) score += 10;
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBgColor = score >= 75 ? 'bg-green-50' : score >= 50 ? 'bg-yellow-50' : 'bg-red-50';
  const scoreBorderColor = score >= 75 ? 'border-green-600' : score >= 50 ? 'border-yellow-600' : 'border-red-600';

  const handleExportPdf = () => {
    // TODO: Implement PDF export
    alert('ייצוא PDF יהיה זמין בקרוב');
  };

  // Extract additional info from raw data
  const address = company._raw?.['כתובת'] || company._raw?.['עיר'] || '';
  const foundingDate = company._raw?.['תאריך_רישום'] || company._raw?.['תאריך רישום'] || '';
  const businessField = company._raw?.['תחום'] || company._raw?.['ענף'] || '';

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Right Side - Company Info */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {company.name || company.corporationName || t('company')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {company.type && (
                <span className="inline-block px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {company.type}
                </span>
              )}
              <IndustryBadge 
                companyId={company.companyNumber || company.id}
                companyName={company.name || company.corporationName}
                companyData={company}
                news={company.news || []}
              />
            </div>
          </div>

          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Number (ח"פ) with Copy Button */}
            {company.companyNumber && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500 mb-1">מספר חברה (ח&quot;פ)</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{company.companyNumber}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="העתק מספר ח.פ"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Registration Number */}
            {company.registrationNumber && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500 mb-1">מספר רישום</span>
                <span className="text-lg font-bold text-gray-900">{company.registrationNumber}</span>
              </div>
            )}

            {/* Status */}
            {company.status && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500 mb-1">סטטוס</span>
                <span className="text-lg text-gray-900">{company.status}</span>
              </div>
            )}

            {/* Address */}
            {address && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500 mb-1">כתובת</span>
                <span className="text-lg text-gray-900">{address}</span>
              </div>
            )}

            {/* Founding Date */}
            {foundingDate && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500 mb-1">תאריך הקמה</span>
                <span className="text-lg text-gray-900">{foundingDate}</span>
              </div>
            )}

            {/* Business Field */}
            {businessField && (
              <div className="flex flex-col md:col-span-2">
                <span className="text-sm font-semibold text-gray-500 mb-1">תחום עיסוק</span>
                <span className="text-lg text-gray-900">{businessField}</span>
              </div>
            )}
          </div>

          {/* Export PDF Button */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={handleExportPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <FileDown size={18} className="sm:w-5 sm:h-5" />
              <span>{t('exportPdf')}</span>
            </button>
          </div>
        </div>

        {/* Score Circle - Always on Side with Golden theme */}
        <div className="flex items-center justify-center w-40 sm:w-48 lg:w-64 shrink-0">
          <div className={`relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-6 lg:border-8 ${scoreBorderColor} ${scoreBgColor} shadow-lg`}>
            <div className="text-center">
              <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${scoreColor}`}>{score}</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">ציון</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Raw Data (Animated Accordion) */}
      {company._raw && Object.keys(company._raw).length > 5 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between cursor-pointer font-semibold text-gray-700 hover:text-gray-900 transition-colors p-3 rounded-lg hover:bg-gray-50"
          >
            <span className="text-lg">פרטים נוספים מרשם החברות</span>
            <ChevronDown 
              size={24} 
              className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(company._raw).map(([key, value]) => {
                // Skip internal fields and already displayed fields
                if (key.startsWith('_') || !value) return null;
                return (
                  <div key={key} className="flex gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-600 min-w-[120px]">{key}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
