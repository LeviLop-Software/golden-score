'use client';

import { useTranslation } from 'react-i18next';
import { FileDown } from 'lucide-react';
import { exportCompanyPdf } from '../lib/pdf';

/**
 * CompanyCard Component
 * Display comprehensive company information from gov.il data
 */
export default function CompanyCard({ company }) {
  const { t } = useTranslation();

  if (!company) {
    return null;
  }

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
    try {
      exportCompanyPdf(company);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('שגיאה בייצוא PDF');
    }
  };

  // Extract additional info from raw data
  const address = company._raw?.['כתובת'] || company._raw?.['עיר'] || '';
  const foundingDate = company._raw?.['תאריך_רישום'] || company._raw?.['תאריך רישום'] || '';
  const businessField = company._raw?.['תחום'] || company._raw?.['ענף'] || '';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Right Side - Company Info */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {company.name || company.corporationName || t('company')}
            </h2>
            {company.type && (
              <span className="inline-block px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {company.type}
              </span>
            )}
          </div>

          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            {company.registrationNumber && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500 mb-1">מספר רישום (ח"פ)</span>
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
          <div className="pt-4">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <FileDown size={20} />
              <span>{t('exportPdf')}</span>
            </button>
          </div>
        </div>

        {/* Left Side - Score Circle */}
        <div className="flex items-center justify-center lg:w-64">
          <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-8 ${scoreBorderColor} ${scoreBgColor}`}>
            <div className="text-center">
              <div className={`text-5xl font-bold ${scoreColor}`}>{score}</div>
              <div className="text-sm font-semibold text-gray-600 mt-1">ציון כללי</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Raw Data (Collapsible) */}
      {company._raw && Object.keys(company._raw).length > 5 && (
        <details className="mt-6 pt-6 border-t border-gray-200">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
            פרטים נוספים מרשם החברות
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {Object.entries(company._raw).map(([key, value]) => {
              // Skip internal fields and already displayed fields
              if (key.startsWith('_') || !value) return null;
              return (
                <div key={key} className="flex gap-2 py-1">
                  <span className="font-medium text-gray-600 min-w-[120px]">{key}:</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
