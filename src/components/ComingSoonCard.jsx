/**
 * ComingSoonCard Component
 * 
 * קומפוננטה גנרית להצגת פיצ'רים שיהיו זמינים בעתיד
 * 
 * Props:
 * - title: כותרת הפיצ'ר
 * - description: תיאור קצר
 * - icon: אייקון (React component)
 */

export default function ComingSoonCard({ 
  title = 'פיצ\'ר חדש',
  description = 'פיצ\'ר זה יהיה זמין בגרסה הבאה',
  icon: Icon = null
}) {
  return (
    <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="bg-amber-100 p-2.5 rounded-full">
            <Icon className="h-5 w-5 text-amber-700" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {title}
            <span className="text-xs font-normal bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
              בקרוב
            </span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
