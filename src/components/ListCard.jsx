'use client';

import { useTranslation } from 'react-i18next';

/**
 * ListCard Component
 * TODO: Add pagination
 * TODO: Add sorting functionality
 * TODO: Add filtering options
 */
export default function ListCard({ title, items = [], renderItem }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{t('noResults')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="border-b last:border-b-0 pb-2">
              {renderItem ? renderItem(item, index) : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
