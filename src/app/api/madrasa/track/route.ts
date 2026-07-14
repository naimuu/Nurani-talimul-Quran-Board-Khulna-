import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Madrasa from '@/lib/models/Madrasa';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get('trackingId');

    if (!trackingId) {
      return NextResponse.json({ success: false, error: 'Tracking ID is required' }, { status: 400 });
    }

    const application = await Madrasa.findOne({ trackingId }).lean();

    if (!application) {
      return NextResponse.json({ success: false, error: 'No application found with this tracking ID' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error: any) {
    console.error('Track API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
