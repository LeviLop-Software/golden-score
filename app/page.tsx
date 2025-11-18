'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/src/components/DashboardLayout';
import AutoComplete from '@/src/components/AutoComplete';

const MAX_SEARCH_HISTORY = 5;

export default function Home() {
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem('companySearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Handle company selection and update history
  const handleCompanySelect = (company: any) => {
    if (company) {
      // Update search history
      const newHistory = [
        company,
        ...searchHistory.filter((item: any) => 
          (item.companyNumber || item.registrationNumber || item.id) !== 
          (company.companyNumber || company.registrationNumber || company.id)
        )
      ].slice(0, MAX_SEARCH_HISTORY);
      
      setSearchHistory(newHistory);
      localStorage.setItem('companySearchHistory', JSON.stringify(newHistory));
      
      // Navigate to company page
      const companyId = company.companyNumber || company.registrationNumber || company.id;
      router.push(`/company/${companyId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-linear-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">{process.env.NEXT_PUBLIC_APP_NAME || 'Golden Score'}</span>
          </h1>
          <p className="text-gray-600 text-lg">מערכת בדיקת אמינות חברות מתקדמת</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">חיפוש חברות</h2>
          <p className="text-gray-600 mb-6">
            חפש חברות ישראליות לפי שם, מספר רישום או מילות מפתח
          </p>
          <AutoComplete onSelect={handleCompanySelect} />
          
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">חיפושים אחרונים</h3>
              <div className="space-y-2">
                {searchHistory.map((company: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{company.companyName || company.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          ח.פ: {company.companyNumber || company.registrationNumber || company.id}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}