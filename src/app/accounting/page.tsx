import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function AccountingPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              একাউন্টিং ও অর্থনৈতিক বিবরণী
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-emerald-600 rounded"></div>
            </div>

            <EditableContent 
              slug="page_accounting"
              defaultContent={`<p>বোর্ডের যাবতীয় একাউন্টিং, আর্থিক নীতিমালা ও ফি পরিশোধ সংক্রান্ত তথ্য।</p>`}
            />
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[400px]">
            <NoticeBoard />
          </div>
          
          <ProfileCard
            slug="secretary"
            name="মহাসচিব"
            title="মহাসচিব"
            imageSrc="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=200&auto=format&fit=crop"
            link="/about/secretary"
            defaultExcerpt="বোর্ডের হিসাব ও অর্থায়ন ব্যবস্থার স্বচ্ছতা ও জবাবদিহিতা নিশ্চিতকরণে আমরা প্রতিশ্রুতিবদ্ধ।"
          />
        </div>

      </div>
    </div>
  );
}
