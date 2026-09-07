import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountingPage() {
  const user = await getUserSession();
  if (user?.role !== "ADMIN" && user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 h-full">
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 mb-2">
              একাউন্টিং ও অর্থনৈতিক বিবরণী
            </h1>
            <div className="flex justify-center mb-6">
              <div className="h-1 w-20 bg-emerald-600 rounded-full"></div>
            </div>

            <EditableContent 
              slug="page_accounting"
              defaultContent={`<p>বোর্ডের যাবতীয় একাউন্টিং, আর্থিক নীতিমালা ও ফি পরিশোধ সংক্রান্ত তথ্য।</p>`}
            />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-20">
            <NoticeBoard />
          </div>
        </div>

      </div>
    </div>
  );
}
