import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";

export default function MemberPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'amela': 'মজলিশে আমেলা(কার্যকরী পরিষদ)',
    'shura': 'মজলিশে সূরা',
    'trainer-inspector': 'প্রশিক্ষক ও পরিদর্শক',
    'office-staff': 'অফিস কর্মকর্তা',
    'employees': 'কর্মচারীবৃন্দ',
  };
  const title = titleMap[params.slug] || 'Members';

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
              slug={`member_${params.slug}`}
              defaultContent={`<p>এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>`}
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
