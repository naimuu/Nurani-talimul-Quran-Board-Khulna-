import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function AuditPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              অডিট ও পর্যবেক্ষণ
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-emerald-600 rounded"></div>
            </div>

            <EditableContent 
              slug="page_audit"
              defaultContent={`<p>খুলনা নূরানী বোর্ডের অডিট ও পরিদর্শন সংক্রান্ত নীতিমালা এবং সংশ্লিষ্ট তথ্যাবলী এখানে প্রদর্শিত হবে।</p>`}
            />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[400px]">
            <NoticeBoard />
          </div>
          
          <ProfileCard
            slug="chairman"
            name="চেয়ারম্যান"
            title="চেয়ারম্যান"
            imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop"
            link="/about/chairman"
            defaultExcerpt="বোর্ডের যাবতীয় হিসাব ও অর্থনৈতিক শৃঙ্খলার অডিট কার্যক্রম নিয়মিত পরিচালিত হয়।"
          />
        </div>

      </div>
    </div>
  );
}
