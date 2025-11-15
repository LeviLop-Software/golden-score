import DashboardLayout from "@/src/components/DashboardLayout";
import SearchBar from "@/src/components/SearchBar";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">חיפוש חברות</h2>
          <p className="text-gray-600 mb-6">
            חפש חברות ישראליות לפי שם, מספר רישום או מילות מפתח
          </p>
          <SearchBar />
        </div>
      </div>
    </DashboardLayout>
  );
}
