'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CompanyCard from '@/src/components/CompanyCard';
import { searchCompanies } from '@/src/services/companyService';
import { useTranslation } from 'react-i18next';

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      const companyId = params.id;
      
      if (!companyId) {
        setError('מספר חברה חסר');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Search by company number (ח"פ)
        const results = await searchCompanies(companyId);
        
        if (results && results.length > 0) {
          // Find exact match by company number
          const exactMatch = results.find(
            c => c.companyNumber === companyId || c.id === companyId
          );
          
          setCompany(exactMatch || results[0]);
        } else {
          setError('חברה לא נמצאה');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('שגיאה בטעינת פרטי החברה');
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">טוען פרטי חברה...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            חזרה לחיפוש
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          ← חזרה לחיפוש
        </button>

        {/* Company Card */}
        {company && <CompanyCard company={company} />}
      </div>
    </div>
  );
}
