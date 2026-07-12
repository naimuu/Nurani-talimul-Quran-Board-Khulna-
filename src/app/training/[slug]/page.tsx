import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

export default function TrainingPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'moallem-arabic': 'মুয়াল্লিম প্রশিক্ষণ (আরবী)',
    'moallem-bangla': 'মুয়াল্লিম প্রশিক্ষণ (বাংলা)',
    'quran-course': 'সহীহ কুরআন শিক্ষা কোর্স',
    'batchwise-center-list': 'ব্যাচভিত্তিক প্রশিক্ষণ কেন্দ্রের তালিকা',
    'permanent-center-list': 'স্থায়ী প্রশিক্ষণ কেন্দ্রসমূহ',
    'rules': 'প্রশিক্ষণের নিয়মাবলী',
    'download-registration': 'ফরম ডাউনলোড',
  };
  const title = titleMap[params.slug] || 'Training';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              {title}
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-red-600 rounded"></div>
            </div>

            <EditableContent 
              slug={`training_${params.slug}`}
              defaultContent={`<p>এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>`}
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
            name="মুফতি জসিম উদ্দীন সাহেব"
            title="মহাসচিব"
            imageSrc="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=200&auto=format&fit=crop"
            link="/about/secretary"
            defaultExcerpt="বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এই চরম উৎকর্ষতার যুগে নূরানী তালীমুল কুরআন বোর্ড পিছিয়ে থাকতে পারে না। তাই বোর্ডের যাবতীয় কার্যক্রমকে আধুনিক ও যুগোপযোগী করার লক্ষ্যে নতুন এই ওয়েবসাইট তৈরি করা হয়েছে। আমাদের লক্ষ্য হলো আ..."
          />
        </div>

      </div>
    </div>
  );
}
