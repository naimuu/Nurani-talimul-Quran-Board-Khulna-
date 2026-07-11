export default function FormsPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'institute-create': 'মাদরাসা নিবন্ধন ফরম',
    'moallem-admission': 'মুয়াল্লিম ভর্তি ফরম',
    'moallem-certificate': 'মুয়াল্লিম সনদ আবেদন ফরম',
    'exam-review': 'উত্তরপত্র পুণঃ নিরীক্ষণের আবেদন',
    'moallem-demand': 'মুয়াল্লিম চাহিদা',
    'khedmot-demand': 'খেদমত চাহিদা',
  };
  const title = titleMap[params.slug] || 'Forms';

  return (
    <div className="container mx-auto py-24 px-4 min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full text-center">
        <p className="text-xl text-gray-600">এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>
      </div>
    </div>
  );
}
