'use client';

import { useTranslation } from 'react-i18next';

/**
 * CompanyCard Component
 * Display company information from gov.il data
 */
export default function CompanyCard({ company }) {
  const { t } = useTranslation();

  if (!company) {
    return null;
  }

  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 shadow-md bg-white">
      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {company.name || company.corporationName || t('company')}
          </h3>
          {company.type && (
            <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {company.type}
            </span>
          )}
        </div>

        {/* Registration Number */}
        {company.registrationNumber && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">מספר רישום (ח"פ):</span>
            <span className="text-gray-900">{company.registrationNumber}</span>
          </div>
        )}

        {/* Status */}
        {company.status && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">סטטוס:</span>
            <span className="text-gray-900">{company.status}</span>
          </div>
        )}

        {/* Additional details from raw data */}
        {company._raw && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">פרטים נוספים:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(company._raw).map(([key, value]) => {
                // Skip internal fields and already displayed fields
                if (key.startsWith('_') || !value || 
                    key === 'מספר_רישום' || key === 'שם_חברה' || 
                    key === 'סטטוס_תאגיד' || key === 'סוג_תאגיד') {
                  return null;
                }
                return (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
