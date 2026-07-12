import NoticeBoard from "@/components/home/NoticeBoard";
import EditableContent from "@/components/EditableContent";
import ProfileCard from "@/components/sidebar/ProfileCard";

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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 h-full">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
              {title}
            </h1>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-24 bg-red-600 rounded"></div>
            </div>

            <EditableContent 
              slug={`member_${params.slug}`}
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
            slug="chairman"
            name="আল্লামা খলিল আহমদ কাসেমী"
            title="চেয়ারম্যান"
            imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200&auto=format&fit=crop"
            link="/about/chairman"
            defaultExcerpt="বিসমিল্লাহির রহমানির রহিম নূরানী তালীমুল কুরআন বোর্ড চট্টগ্রাম বাংলাদেশ এর সার্বিক কার্যক্রম বিস্তৃতির লক্ষ্যে নতুন ওয়েবসাইট খোলা হচ্ছে জেনে প্রথমত আমি মহান আল্লাহ তায়ালার দরবারে শুকরিয়া আদায় করছি এবং বোর্ডের সকল কর্মকর্তা-কর্মচারী সহ সংশ্লিষ্ট সকলকে আন্তরিক মোবারকবাদ ও অভিনন্দন জানাচ্ছি। বর্তমান যুগ আধুনিক তথ্য প্রযুক্তির যুগ। বিজ্ঞানের উন্নতির এ..."
          />
        </div>

      </div>
    </div>
  );
}
