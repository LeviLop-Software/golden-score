'use client';

/**
 * KpiCard Component
 * TODO: Add trend indicators (up/down arrows)
 * TODO: Add color coding based on value
 * TODO: Add click handler for details
 */
export default function KpiCard({ title, value, unit, trend }) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h4 className="text-sm text-gray-600 mb-2">{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="text-gray-500">{unit}</span>}
      </div>
      {trend && (
        <div className="mt-2 text-sm">
          {/* TODO: Display trend with icon */}
          <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  );
}
