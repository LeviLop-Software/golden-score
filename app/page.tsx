'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import AutoComplete from '@/src/components/AutoComplete';
import CompanyCard from '@/src/components/CompanyCard';
import CompanyChangesList from '@/src/components/CompanyChangesList';
import { fetchCompanyChanges } from '@/src/lib/apiClient';

export default function Home() {
  const [selected, setSelected] = useState<any>(null);
  const [companyChanges, setCompanyChanges] = useState<any[]>([]);
  const [loadingChanges, setLoadingChanges] = useState(false);

  // Fetch company changes when a company is selected
  useEffect(() => {
    async function fetchChanges() {
      if (!selected) {
        setCompanyChanges([]);
        return;
      }

      const companyNumber = selected.companyNumber || selected.registrationNumber || selected.id;
      
      if (!companyNumber) {
        setCompanyChanges([]);
        return;
      }

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
    }

    fetchChanges();
  }, [selected]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
            <CompanyChangesList changes={companyChanges} loading={loadingChanges} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}