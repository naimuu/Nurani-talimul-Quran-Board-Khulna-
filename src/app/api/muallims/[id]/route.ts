import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Muallim from '@/lib/models/Muallim';
import TrainingBatch from '@/lib/models/TrainingBatch';
import { getUserSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const muallim = await Muallim.findById(params.id).lean();
    if (!muallim) {
      return NextResponse.json({ success: false, error: 'মুয়াল্লিম পাওয়া যায়নি' }, { status: 404 });
    }

    // Get all batches assigned to this muallim
    const batches = await TrainingBatch.find({ muallimId: params.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      muallim: {
        ...muallim,
        id: muallim._id.toString(),
        batches: batches.map(b => ({
          ...b,
          id: b._id.toString()
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching muallim details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত অ্যাক্সেস (Unauthorized)' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.altPhone !== undefined) updateData.altPhone = (body.altPhone || '').trim();
    if (body.email !== undefined) updateData.email = (body.email || '').trim();
    if (body.nid !== undefined) updateData.nid = (body.nid || '').trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.designation !== undefined) updateData.designation = (body.designation || '').trim();
    if (body.specialty !== undefined) updateData.specialty = (body.specialty || '').trim();
    if (body.education !== undefined) updateData.education = (body.education || '').trim();
    if (body.trainingDetails !== undefined) updateData.trainingDetails = (body.trainingDetails || '').trim();
    if (body.experienceYears !== undefined) updateData.experienceYears = (body.experienceYears || '').trim();
    if (body.address !== undefined) updateData.address = (body.address || '').trim();
    if (body.division !== undefined) updateData.division = (body.division || '').trim();
    if (body.district !== undefined) updateData.district = (body.district || '').trim();
    if (body.upazila !== undefined) updateData.upazila = (body.upazila || '').trim();
    if (body.union !== undefined) updateData.union = (body.union || '').trim();
    if (body.village !== undefined) updateData.village = (body.village || '').trim();
    if (body.photoUrl !== undefined) updateData.photoUrl = (body.photoUrl || '').trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = (body.notes || '').trim();
    if (body.order !== undefined) updateData.order = Number(body.order) || 0;

    const updated = await Muallim.findByIdAndUpdate(params.id, updateData, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: 'মুয়াল্লিম পাওয়া যায়নি' }, { status: 404 });
    }

    // Sync info to any training batches where this muallim is assigned
    if (updateData.name || updateData.phone || updateData.designation || updateData.photoUrl !== undefined) {
      const syncData: any = {};
      if (updateData.name) syncData.muallimName = updateData.name;
      if (updateData.phone) syncData.muallimPhone = updateData.phone;
      if (updateData.designation) syncData.muallimDesignation = updateData.designation;
      if (updateData.photoUrl !== undefined) syncData.muallimPhoto = updateData.photoUrl;

      await TrainingBatch.updateMany({ muallimId: params.id }, { $set: syncData });
    }

    return NextResponse.json({
      success: true,
      muallim: {
        ...updated,
        id: updated._id.toString()
      }
    });
  } catch (error: any) {
    console.error('Error updating muallim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত অ্যাক্সেস (Unauthorized)' }, { status: 401 });
    }

    await connectDB();
    const deleted = await Muallim.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'মুয়াল্লিম পাওয়া যায়নি' }, { status: 404 });
    }

    // Clear assignment in batches
    await TrainingBatch.updateMany(
      { muallimId: params.id },
      {
        $set: {
          muallimId: null,
          muallimName: '',
          muallimPhone: '',
          muallimDesignation: '',
          muallimPhoto: '',
          muallimTiming: ''
        }
      }
    );

    return NextResponse.json({ success: true, message: 'মুয়াল্লিম সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    console.error('Error deleting muallim:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
