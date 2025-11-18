'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import CompanyCard from '@/src/components/CompanyCard';
import CompanyChangesList from '@/src/components/CompanyChangesList';
import CompanyInsolvencyList from '@/src/components/CompanyInsolvencyList';
import TrusteeCard from '@/src/components/TrusteeCard';
import SkeletonCard from '@/src/components/SkeletonCard';
import { searchCompanies } from '@/src/services/companyService';
import { fetchCompanyChanges, fetchCompanyInsolvency, fetchCompanyTrustee } from '@/src/lib/apiClient';
import { useTranslation } from 'react-i18next';

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [company, setCompany] = useState(null);
  const [companyChanges, setCompanyChanges] = useState([]);
  const [insolvencyData, setInsolvencyData] = useState(null);
  const [trusteeData, setTrusteeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [loadingInsolvency, setLoadingInsolvency] = useState(false);
  const [loadingTrustee, setLoadingTrustee] = useState(false);
  const [error, setError] = useState(null);

  // Generate meta tags and structured data
  const generateMetaTags = () => {
    if (!company) return null;
    
    const companyName = company.companyName || company.name || 'חברה';
    const companyNumber = company.companyNumber || company.id || '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pageUrl = `${baseUrl}/company/${companyNumber}`;
    const title = `${companyName} - בדיקת אמינות | ${process.env.NEXT_PUBLIC_APP_NAME || 'Golden Score'}`;
    const description = `בדוק את האמינות העסקית של ${companyName} (ח.פ ${companyNumber}) - מידע מקיף על שינויים, חדלות פירעון וכונסי נכסים`;
    
    return {
      title,
      description,
      pageUrl,
      companyName,
      companyNumber,
    };
  };

  const metaData = generateMetaTags();

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
          
          const foundCompany = exactMatch || results[0];
          setCompany(foundCompany);
          
          // Fetch company changes
          setLoadingChanges(true);
          try {
            const changes = await fetchCompanyChanges(companyId);
            setCompanyChanges(changes);
          } catch (err) {
            console.error('Error fetching company changes:', err);
            setCompanyChanges([]);
          } finally {
            setLoadingChanges(false);
          }

          // Fetch insolvency data
          setLoadingInsolvency(true);
          try {
            const data = await fetchCompanyInsolvency(companyId);
            setInsolvencyData(data);
          } catch (err) {
            console.error('Error fetching insolvency data:', err);
            setInsolvencyData({ caseCount: 0, cases: [] });
          } finally {
            setLoadingInsolvency(false);
          }

          // Fetch trustee data
          setLoadingTrustee(true);
          try {
            const data = await fetchCompanyTrustee(companyId);
            setTrusteeData(data);
          } catch (err) {
            console.error('Error fetching trustee data:', err);
            setTrusteeData(null);
          } finally {
            setLoadingTrustee(false);
          }
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
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Back Button Skeleton */}
          <div className="mb-6 h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          
          {/* Skeletons */}
          <div className="space-y-6">
            <SkeletonCard type="company" />
            <SkeletonCard type="list" />
            <SkeletonCard type="list" />
            <SkeletonCard type="trustee" />
          </div>
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
    <>
      {/* Meta Tags for SEO and Social Sharing */}
      {metaData && (
        <Head>
          <title>{metaData.title}</title>
          <meta name="description" content={metaData.description} />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={metaData.pageUrl} />
          <meta property="og:title" content={metaData.title} />
          <meta property="og:description" content={metaData.description} />
          <meta property="og:site_name" content={process.env.NEXT_PUBLIC_APP_NAME || 'Golden Score'} />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={metaData.pageUrl} />
          <meta property="twitter:title" content={metaData.title} />
          <meta property="twitter:description" content={metaData.description} />
          
          {/* Canonical URL */}
          <link rel="canonical" href={metaData.pageUrl} />
        </Head>
      )}
      
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4" dir="rtl">
        {/* Schema.org JSON-LD Structured Data */}
        {metaData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: metaData.companyName,
                identifier: metaData.companyNumber,
                url: metaData.pageUrl,
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'IL',
                },
              }),
            }}
          />
        )}
        
        <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          ← חזרה לחיפוש
        </button>

        {/* Company Card */}
        {company && (
          <div className="space-y-6">
            <CompanyCard company={company} />
            
            {/* Changes - show skeleton or data */}
            {loadingChanges ? (
              <SkeletonCard type="list" />
            ) : (
              <CompanyChangesList changes={companyChanges} loading={false} />
            )}
            
            {/* Insolvency - show skeleton or data */}
            {loadingInsolvency ? (
              <SkeletonCard type="list" />
            ) : (
              <CompanyInsolvencyList insolvencyData={insolvencyData} loading={false} />
            )}
            
            {/* Trustee - show skeleton or data */}
            {loadingTrustee ? (
              <SkeletonCard type="trustee" />
            ) : (
              trusteeData && <TrusteeCard companyId={trusteeData.companyId} />
            )}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
