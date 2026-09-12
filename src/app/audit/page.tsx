import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";

export default function AuditPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 h-full">
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 mb-2">
              অডিট ও পর্যবেক্ষণ
            </h1>
            <div className="flex justify-center mb-6">
              <div className="h-1 w-20 bg-emerald-600 rounded-full"></div>
            </div>

            <EditableContent 
              slug="page_audit"
              defaultContent={`<p>নূরানী বোর্ড খুলনার অডিট ও পরিদর্শন সংক্রান্ত নীতিমালা এবং সংশ্লিষ্ট তথ্যাবলী এখানে প্রদর্শিত হবে।</p>`}
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
