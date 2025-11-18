'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import AutoComplete from '@/src/components/AutoComplete';
import CompanyCard from '@/src/components/CompanyCard';
import CompanyChangesList from '@/src/components/CompanyChangesList';
import CompanyInsolvencyList from '@/src/components/CompanyInsolvencyList';
import TrusteeCard from '@/src/components/TrusteeCard';
import SkeletonCard from '@/src/components/SkeletonCard';
import { fetchCompanyChanges, fetchCompanyInsolvency, fetchCompanyTrustee } from '@/src/lib/apiClient';

export default function Home() {
  const [selected, setSelected] = useState<any>(null);
  const [companyChanges, setCompanyChanges] = useState<any[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);
  const [insolvencyData, setInsolvencyData] = useState<any>(null);
  const [loadingInsolvency, setLoadingInsolvency] = useState(false);
  const [trusteeData, setTrusteeData] = useState<any>(null);
  const [loadingTrustee, setLoadingTrustee] = useState(false);

  // Fetch company changes, insolvency, and trustee data when a company is selected
  useEffect(() => {
    async function fetchData() {
      if (!selected) {
        setCompanyChanges([]);
        setInsolvencyData(null);
        setTrusteeData(null);
        return;
      }

      const companyNumber = selected.companyNumber || selected.registrationNumber || selected.id;
      
      if (!companyNumber) {
        setCompanyChanges([]);
        setInsolvencyData(null);
        setTrusteeData(null);
        return;
      }

      // Fetch changes
      try {
        setLoadingChanges(true);
        const changes = await fetchCompanyChanges(companyNumber);
        setCompanyChanges(changes);
      } catch (error) {
        console.error('Error loading company changes:', error);
        setCompanyChanges([]);
      } finally {
        setLoadingChanges(false);
      }

      // Fetch insolvency data
      try {
        setLoadingInsolvency(true);
        const data = await fetchCompanyInsolvency(companyNumber);
        setInsolvencyData(data);
      } catch (error) {
        console.error('Error loading insolvency data:', error);
        setInsolvencyData({ caseCount: 0, cases: [] });
      } finally {
        setLoadingInsolvency(false);
      }

      // Fetch trustee data
      try {
        setLoadingTrustee(true);
        const data = await fetchCompanyTrustee(companyNumber);
        setTrusteeData(data);
      } catch (error) {
        console.error('Error loading trustee data:', error);
        setTrusteeData(null);
      } finally {
        setLoadingTrustee(false);
      }
    }

    fetchData();
  }, [selected]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Golden Score branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-linear-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">Golden Score</span>
          </h1>
          <p className="text-gray-600 text-lg">מערכת בדיקת אמינות חברות מתקדמת</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">חיפוש חברות</h2>
          <p className="text-gray-600 mb-6">
            חפש חברות ישראליות לפי שם, מספר רישום או מילות מפתח
          </p>
          <AutoComplete onSelect={setSelected} />
        </div>

        {/* Display selected company card */}
        {selected && (
          <div className="animate-fadeIn space-y-6">
            <CompanyCard company={selected} />
            
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
    </DashboardLayout>
  );
}