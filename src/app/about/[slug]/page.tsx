export default function AboutPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'board_introduction': 'বোর্ড পরিচিতি',
    'our_activities': 'আমাদের কার্যক্রম',
    'chairman': 'চেয়ারম্যান',
    'secretary': 'মহাসচিব',
  };
  const title = titleMap[params.slug] || 'About Us';

  return (
    <div className="container mx-auto py-24 px-4 min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full text-center">
        <p className="text-xl text-gray-600">এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>
        <p className="text-gray-400 mt-4">(This page is under construction.)</p>
      </div>
    </div>
  );
}
