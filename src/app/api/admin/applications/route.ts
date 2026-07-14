import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Madrasa from '@/lib/models/Madrasa';

// GET: List all applications (optionally filtered by status)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query = status ? { status } : {};
    const applications = await Madrasa.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, applications }, { status: 200 });
  } catch (error: any) {
    console.error('Admin applications GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Approve or reject an application
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'id and action are required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // Generate a unique registration code: KNB-XXXX
      const count = await Madrasa.countDocuments({ status: 'APPROVED' });
      const code = `KNB-${String(count + 1).padStart(4, '0')}`;

      const updated = await Madrasa.findByIdAndUpdate(
        id,
        { status: 'APPROVED', code },
        { new: true }
      );
      return NextResponse.json({ success: true, application: updated });
    }

    if (action === 'REJECT') {
      const updated = await Madrasa.findByIdAndUpdate(
        id,
        { status: 'REJECTED' },
        { new: true }
      );
      return NextResponse.json({ success: true, application: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin applications PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
