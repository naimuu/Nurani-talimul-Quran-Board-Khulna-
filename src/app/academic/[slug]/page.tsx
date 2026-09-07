import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";

export default function AcademicPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'routine': 'পরীক্ষার রুটিন',
    'question-order': 'প্রশ্নের অর্ডার',
    'registration-rules': 'নিবন্ধনের নিয়মাবলী',
    'registered-students': 'নিবন্ধনকৃত পরীক্ষার্থীদের তালিকা',
    'admit-card': 'প্রবেশপত্র প্রিন্ট ও ডাউনলোড',
    'mark-sheet': 'মাদ্রাসার নম্বরপত্র ও মার্কশিট',
  };
  const title = titleMap[params.slug] || 'পরীক্ষা সংক্রান্ত';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 h-full">
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 mb-2">
              {title}
            </h1>
            <div className="flex justify-center mb-6">
              <div className="h-1 w-20 bg-emerald-600 rounded-full"></div>
            </div>

            <EditableContent 
              slug={`academic_${params.slug}`}
              defaultContent={`<p>এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে বিস্তারিত তথ্য যুক্ত করা হবে।</p>`}
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
