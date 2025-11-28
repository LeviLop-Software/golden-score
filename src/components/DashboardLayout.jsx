'use client';

/**
 * DashboardLayout Component
 * TODO: Implement sidebar/navigation
 * TODO: Add header with user info
 * TODO: Add responsive layout
 */
export default function DashboardLayout({ children }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Golden Score';
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-600">
          <p className="text-sm">
            {appName} <span className="text-gray-400">v{appVersion}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} כל הזכויות שמורות
          </p>
        </div>
      </footer>
    </div>
  );
}
