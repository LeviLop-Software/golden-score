'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * CompanyInsolvencyList Component
 * Displays insolvency (חדלות פירעון) cases for a company
 */
export default function CompanyInsolvencyList({ insolvencyData, loading = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">הליכי חדלות פירעון</h3>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>טוען נתוני חדלות פירעון...</span>
        </div>
      </div>
    );
  }

  const caseCount = insolvencyData?.caseCount || 0;
  const cases = insolvencyData?.cases || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200" dir="rtl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between cursor-pointer mb-6 hover:opacity-80 transition-opacity"
      >
        <h3 className="text-2xl font-bold text-gray-900">הליכי חדלות פירעון</h3>
        <ChevronDown 
          size={28} 
          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {caseCount === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✓ אין מידע על הליכי חדלות פירעון</p>
          <p className="text-green-600 text-sm mt-1">החברה לא מופיעה במאגר משרד המשפטים</p>
        </div>
      ) : (
        <>
          {/* Warning Badge */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-bold text-lg">⚠️ נמצאו {caseCount} הליכי חדלות פירעון</p>
            <p className="text-red-600 text-sm mt-1">נתונים ממאגר משרד המשפטים</p>
          </div>

          {/* Cases List */}
          <div className="space-y-0">
            {cases.map((insolvencyCase, index) => (
              <div 
                key={index}
                className={`py-4 ${index < cases.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition-colors px-2 -mx-2 rounded`}
              >
                {/* Header: Type and Date */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-red-700">
                      {insolvencyCase.type || 'הליך חדלות פירעון'}
                    </h4>
                    {insolvencyCase.proceedingId && (
                      <span className="text-sm text-gray-600">מזהה הליך: {insolvencyCase.proceedingId}</span>
                    )}
                  </div>
                  {insolvencyCase.openingDate && (
                    <span className="text-sm text-gray-500 font-medium">
                      {insolvencyCase.openingDate}
                    </span>
                  )}
                </div>
                
                {/* Status */}
                {insolvencyCase.status && (
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                      סטטוס: {insolvencyCase.status}
                    </span>
                  </div>
                )}

                {/* Trustees */}
                {insolvencyCase.trustees && insolvencyCase.trustees.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">כונסי נכסים:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {insolvencyCase.trustees.map((trustee, idx) => (
                        <li key={idx}>• {typeof trustee === 'string' ? trustee : trustee.name || 'לא צוין'}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Orders */}
                {insolvencyCase.orders && insolvencyCase.orders.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">צווים ({insolvencyCase.orders.length}):</p>
                    <div className="text-sm text-gray-600">
                      <p className="italic">פרטי צווים זמינים במערכת</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
