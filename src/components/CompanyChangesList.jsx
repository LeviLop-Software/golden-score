'use client';

/**
 * CompanyChangesList Component
 * Displays a list of company changes in a clean card format
 */
export default function CompanyChangesList({ changes, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">שינויים על החברה</h3>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>טוען שינויים...</span>
        </div>
      </div>
    );
  }

  if (!changes || changes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">שינויים על החברה</h3>
        <p className="text-gray-500 italic">לא נמצאו שינויים רשומים</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200" dir="rtl">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">שינויים על החברה</h3>
      
      <div className="space-y-0">
        {changes.map((change, index) => (
          <div 
            key={index}
            className={`py-4 ${index < changes.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition-colors px-2 -mx-2 rounded`}
          >
            {/* Header: Type and Date */}
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-bold text-gray-900">
                {change.type || 'שינוי'}
              </h4>
              {change.date && (
                <span className="text-sm text-gray-500 font-medium">
                  {change.date}
                </span>
              )}
            </div>
            
            {/* Details */}
            {change.details && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {change.details}
              </p>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer with count */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          סך הכל {changes.length} שינויים
        </p>
      </div>
    </div>
  );
}
