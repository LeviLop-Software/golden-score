'use client';

import { useTranslation } from 'react-i18next';

/**
 * DashboardLayout Component
 * TODO: Implement sidebar/navigation
 * TODO: Add header with user info
 * TODO: Add responsive layout
 */
export default function DashboardLayout({ children }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-600">
          {/* TODO: Add footer content */}
        </div>
      </footer>
    </div>
  );
}
