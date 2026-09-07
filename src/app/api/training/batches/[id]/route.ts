import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrainingBatch from '@/lib/models/TrainingBatch';
import { getUserSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updateData: any = {};
    if (body.medium !== undefined) updateData.medium = body.medium.toLowerCase();
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle.trim();
    if (body.badge !== undefined) updateData.badge = body.badge.trim();
    if (body.durationDays !== undefined) updateData.durationDays = String(body.durationDays).trim();
    if (body.durationText !== undefined) updateData.durationText = body.durationText.trim();
    if (body.price !== undefined) updateData.price = body.price.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.date !== undefined) updateData.date = body.date.trim();
    if (body.batch !== undefined) updateData.batch = body.batch.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.link !== undefined) updateData.link = body.link.trim();
    if (body.regLink !== undefined) updateData.regLink = body.regLink.trim();
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage.trim();
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.order !== undefined) updateData.order = Number(body.order) || 0;

    const updated = await TrainingBatch.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'ব্যাচ পাওয়া যায়নি' }, { status: 404 });
    }

    const formatted = {
      ...updated,
      id: (updated as any)._id.toString()
    };

    return NextResponse.json({ success: true, batch: formatted });
  } catch (error: any) {
    console.error('Error updating training batch:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    await TrainingBatch.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'ব্যাচ সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    console.error('Error deleting training batch:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
