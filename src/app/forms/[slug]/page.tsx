import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function FormsPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'ilhaq-rules': 'ইলহাক করার নিয়মাবলী',
    'ilhaq-download': 'ইলহাক ফরম ডাউনলোড ও শেয়ার',
    'institute-create': 'মাদরাসা নিবন্ধন ফরম',
    'moallem-admission': 'মুয়াল্লিম ভর্তি ফরম',
    'moallem-certificate': 'মুয়াল্লিম সনদ আবেদন ফরম',
    'exam-review': 'উত্তরপত্র পুণঃ নিরীক্ষণের আবেদন',
    'moallem-demand': 'মুয়াল্লিম চাহিদা',
    'khedmot-demand': 'খেদমত চাহিদা',
  };
  const title = titleMap[params.slug] || 'আবেদন ফরম';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              {title}
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-emerald-600 rounded"></div>
            </div>

            <EditableContent 
              slug={`forms_${params.slug}`}
              defaultContent={`<p>এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে ফরম ও নির্দেশিকা যুক্ত করা হবে।</p>`}
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
            defaultExcerpt="বোর্ডের ইলহাক ও অন্যান্য অফিসিয়াল ফরমের নিয়মাবলী ও ডাউনলোড সম্পর্কিত তথ্য এখানে সংরক্ষিত আছে।"
          />
        </div>

      </div>
    </div>
  );
}
