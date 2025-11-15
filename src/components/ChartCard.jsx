'use client';

/**
 * ChartCard Component
 * TODO: Integrate with Chart.js or react-chartjs-2
 * TODO: Add chart type selection (line, bar, pie)
 * TODO: Add data formatting utilities
 */
export default function ChartCard({ title, data, type = 'line' }) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
        {/* TODO: Implement Chart.js component */}
        <p className="text-gray-500">Chart placeholder - {type}</p>
      </div>
    </div>
  );
}
