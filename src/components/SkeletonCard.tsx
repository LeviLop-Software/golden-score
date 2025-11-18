/**
 * SkeletonCard Component
 * Skeleton loader למצב טעינה - מראה למשתמש שמשהו קורה
 */

interface SkeletonCardProps {
  type?: 'company' | 'list' | 'trustee';
}

export default function SkeletonCard({ type = 'list' }: SkeletonCardProps) {
  if (type === 'company') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 animate-pulse" dir="rtl">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Score Section */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'trustee') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Alert Box */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: list type
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 animate-pulse" dir="rtl">
      {/* Title */}
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

      {/* List Items */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="py-4 border-b border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}
