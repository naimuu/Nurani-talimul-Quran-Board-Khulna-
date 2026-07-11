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
    <div className="container mx-auto py-24 px-4 min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full text-center">
        <p className="text-xl text-gray-600">এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>
      </div>
    </div>
  );
}
