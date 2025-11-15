'use client';

import { useState } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import AutoComplete from '@/src/components/AutoComplete';
import CompanyCard from '@/src/components/CompanyCard';

export default function Home() {
  const [selected, setSelected] = useState(null);

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
          <div className="animate-fadeIn">
            <CompanyCard company={selected} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
