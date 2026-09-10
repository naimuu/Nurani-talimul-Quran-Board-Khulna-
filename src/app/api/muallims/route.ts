import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Muallim from '@/lib/models/Muallim';
import TrainingBatch from '@/lib/models/TrainingBatch';
import { getUserSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const filter: any = {};
    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      filter.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { designation: searchRegex },
        { specialty: searchRegex },
        { district: searchRegex },
        { education: searchRegex }
      ];
    }

    const muallims = await Muallim.find(filter).sort({ order: 1, createdAt: -1 }).lean();

    // Fetch batch counts for each muallim to show on card
    const muallimIds = muallims.map(m => m._id);
    const batchCounts = await TrainingBatch.aggregate([
      { $match: { muallimId: { $in: muallimIds } } },
      { $group: { _id: "$muallimId", count: { $sum: 1 } } }
    ]);
    const batchCountMap = new Map(batchCounts.map(b => [b._id.toString(), b.count]));

    const formatted = muallims.map(m => ({
      ...m,
      id: m._id ? m._id.toString() : (m as any).id,
      assignedBatchCount: batchCountMap.get(m._id.toString()) || 0
    }));

    return NextResponse.json({ success: true, muallims: formatted });
  } catch (error: any) {
    console.error('Error fetching muallims:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      name,
      phone,
      altPhone,
      email,
      nid,
      gender,
      designation,
      specialty,
      education,
      trainingDetails,
      experienceYears,
      address,
      division,
      district,
      upazila,
      union,
      village,
      photoUrl,
      status,
      notes,
      order
    } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ success: false, error: 'মুয়াল্লিমের নাম ও মোবাইল নম্বর পূরণ করা আবশ্যক' }, { status: 400 });
    }

    const newMuallim = await Muallim.create({
      name: name.trim(),
      phone: phone.trim(),
      altPhone: (altPhone || '').trim(),
      email: (email || '').trim(),
      nid: (nid || '').trim(),
      gender: gender || 'পুরুষ',
      designation: (designation || 'মুয়াল্লিম ও শিক্ষক প্রশিক্ষক').trim(),
      specialty: (specialty || '').trim(),
      education: (education || '').trim(),
      trainingDetails: (trainingDetails || '').trim(),
      experienceYears: (experienceYears || '').trim(),
      address: (address || '').trim(),
      division: (division || 'খুলনা').trim(),
      district: (district || 'খুলনা').trim(),
      upazila: (upazila || '').trim(),
      union: (union || '').trim(),
      village: (village || '').trim(),
      photoUrl: (photoUrl || '').trim(),
      status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      notes: (notes || '').trim(),
      order: Number(order) || 0
    });

    const formatted = {
      ...newMuallim.toObject(),
      id: newMuallim._id.toString(),
      assignedBatchCount: 0
    };

    return NextResponse.json({ success: true, muallim: formatted });
  } catch (error: any) {
    console.error('Error creating muallim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
