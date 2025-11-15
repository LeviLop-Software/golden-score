'use client';

import { useTranslation } from 'react-i18next';

/**
 * CompanyCard Component
 * TODO: Add styling and layout
 * TODO: Display company metrics
 * TODO: Add actions (export, details)
 */
export default function CompanyCard({ company }) {
  const { t } = useTranslation();

  if (!company) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold mb-2">{company.name || t('company')}</h3>
      <div className="space-y-2">
        <p className="text-gray-600">
          {t('score')}: {company.score || 'N/A'}
        </p>
        {/* TODO: Add more company details */}
      </div>
    </div>
  );
}
