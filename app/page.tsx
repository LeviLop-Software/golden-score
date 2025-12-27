'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/src/components/DashboardLayout';
import AutoComplete from '@/src/components/AutoComplete';

const MAX_SEARCH_HISTORY = 15;

interface Company {
  companyNumber?: string;
  registrationNumber?: string;
  id?: string;
  companyName?: string;
  name?: string;
}

export default function Home() {
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<Company[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      const history = localStorage.getItem('companySearchHistory');
      if (history) {
        try {
          setSearchHistory(JSON.parse(history) as Company[]);
        } catch {
          // Invalid history, ignore
        }
      }
    };
    
    loadHistory();
  }, []);

  // Handle company selection and update history
  const handleCompanySelect = (company: Company) => {
    if (company) {
      // Update search history
      const newHistory = [
        company,
        ...searchHistory.filter((item: Company) => 
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

  // Handle removing a company from history
  const handleRemoveFromHistory = (e: React.MouseEvent, companyToRemove: Company) => {
    e.stopPropagation(); // Prevent navigation
    const companyId = companyToRemove.companyNumber || companyToRemove.registrationNumber || companyToRemove.id;
    const newHistory = searchHistory.filter((item: Company) => 
      (item.companyNumber || item.registrationNumber || item.id) !== companyId
    );
    setSearchHistory(newHistory);
    localStorage.setItem('companySearchHistory', JSON.stringify(newHistory));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-linear-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">{process.env.NEXT_PUBLIC_APP_NAME || 'Golden Score'}</span>
          </h1>
          <p className="text-gray-600 text-lg">מערכת בדיקת ח.פ ורקע עסקי חברות ישראליות מתקדמת</p>
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
                {searchHistory.map((company: Company, index: number) => (
                  <div
                    key={index}
                    className="relative"
                  >
                    <button
                      onClick={() => handleCompanySelect(company)}
                      className="w-full text-right px-4 py-3 pr-12 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300"
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
                    {/* Delete button - always visible */}
                    <button
                      onClick={(e) => handleRemoveFromHistory(e, company)}
                      className="absolute top-1/2 -translate-y-1/2 left-2 p-1 bg-red-50 hover:bg-red-100 rounded-full border border-red-200 hover:border-red-300 transition-all duration-200 shadow-sm"
                      title="הסר מההיסטוריה"
                    >
                      <svg className="w-4 h-4 text-red-500 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}