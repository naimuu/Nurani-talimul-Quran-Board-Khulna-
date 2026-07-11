export default function AcademicPage({ params }: { params: { slug: string } }) {
  const titleMap: Record<string, string> = {
    'admit-card': 'প্রবেশপত্র',
    'mark-sheet': 'নম্বরপত্র',
  };
  const title = titleMap[params.slug] || 'Academic';

  return (
    <div className="container mx-auto py-24 px-4 min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl w-full text-center">
        <p className="text-xl text-gray-600">এই পৃষ্ঠাটি তৈরির কাজ চলছে। খুব শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>
      </div>
    </div>
  );
}
