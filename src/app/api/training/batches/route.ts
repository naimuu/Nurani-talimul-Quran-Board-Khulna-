import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrainingBatch from '@/lib/models/TrainingBatch';
import { getUserSession } from '@/lib/auth';

const defaultBatches = [
  {
    medium: 'bangla',
    title: 'মুয়াল্লিম প্রশিক্ষণ (বাংলা)',
    subtitle: '৩০ দিন ব্যাপী বিশেষ শিক্ষক প্রশিক্ষণ কোর্স',
    badge: 'বাংলা মাধ্যম',
    durationDays: '৩০',
    durationText: 'দিন মেয়াদী প্রশিক্ষণ',
    price: '৳ ৫,৫০০',
    location: 'খুলনা বিভাগীয় কার্যালয় ও জেলা কেন্দ্র',
    date: 'চলমান / নতুন সেশন',
    batch: 'ব্যাচ নং: ১২৪ (বাংলা)',
    phone: '01966-935832, 01988-977209',
    link: '/training/moallem-bangla',
    regLink: '/register',
    isActive: true,
    order: 0
  },
  {
    medium: 'arabic',
    title: 'মুয়াল্লিম প্রশিক্ষণ (আরবী)',
    subtitle: '৫০ দিন ব্যাপী উচ্চতর আরবী শিক্ষক প্রশিক্ষণ',
    badge: 'আরবি মাধ্যম',
    durationDays: '৫০',
    durationText: 'দিন মেয়াদী প্রশিক্ষণ',
    price: '৳ ৭,৫০০',
    location: 'খুলনা কেন্দ্রীয় কেন্দ্র ও সারাদেশের শাখাসমূহ',
    date: 'চলমান / কেন্দ্রীয় ব্যাচ',
    batch: 'ব্যাচ নং: ৮৫৪ (আরবী)',
    phone: '01966-935832, 01939-895290',
    link: '/training/moallem-arabic',
    regLink: '/register',
    isActive: true,
    order: 0
  }
];

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const medium = searchParams.get('medium');
    const all = searchParams.get('all') === 'true';

    const filter: any = {};
    if (medium) {
      filter.medium = medium;
    }
    if (!all) {
      filter.isActive = true;
    }

    let batches = await TrainingBatch.find(filter).sort({ order: 1, createdAt: -1 }).lean();

    // Auto-seed if collection is completely empty
    if (!batches || batches.length === 0) {
      const count = await TrainingBatch.countDocuments();
      if (count === 0) {
        await TrainingBatch.insertMany(defaultBatches);
        batches = await TrainingBatch.find(filter).sort({ order: 1, createdAt: -1 }).lean();
      }
    }

    if (!batches || batches.length === 0) {
      batches = defaultBatches.filter(b => !medium || b.medium === medium) as any;
    }

    const formatted = batches.map(b => ({
      ...b,
      id: (b as any)._id ? (b as any)._id.toString() : (b as any).id
    }));

    return NextResponse.json({ success: true, batches: formatted });
  } catch (error: any) {
    console.error('Error fetching training batches:', error);
    return NextResponse.json({ success: false, batches: defaultBatches, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত অ্যাক্সেস (Unauthorized)' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const {
      medium,
      title,
      subtitle,
      badge,
      durationDays,
      durationText,
      price,
      location,
      date,
      batch,
      phone,
      link,
      regLink,
      coverImage,
      isActive,
      order
    } = body;

    if (!medium || !title || !batch || !phone) {
      return NextResponse.json({ success: false, error: 'মাধ্যম, শিরোনাম, ব্যাচ নম্বর ও ফোন নম্বর পূরণ করুন' }, { status: 400 });
    }

    const newBatch = await TrainingBatch.create({
      medium: medium.toLowerCase(),
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      badge: badge ? badge.trim() : (medium === 'arabic' ? 'আরবি মাধ্যম' : 'বাংলা মাধ্যম'),
      durationDays: (durationDays || '').trim(),
      durationText: (durationText || 'দিন মেয়াদী প্রশিক্ষণ').trim(),
      price: (price || '').trim(),
      location: (location || 'খুলনা বিভাগীয় কার্যালয়').trim(),
      date: (date || 'চলমান / নতুন সেশন').trim(),
      batch: batch.trim(),
      phone: phone.trim(),
      link: (link || (medium === 'arabic' ? '/training/moallem-arabic' : '/training/moallem-bangla')).trim(),
      regLink: (regLink || '/register').trim(),
      coverImage: (coverImage || '').trim(),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: Number(order) || 0
    });

    const formatted = {
      ...newBatch.toObject(),
      id: newBatch._id.toString()
    };

    return NextResponse.json({ success: true, batch: formatted });
  } catch (error: any) {
    console.error('Error creating training batch:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
