import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Madrasa from '@/lib/models/Madrasa';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    // Generate an 8-digit tracking ID
    const trackingId = Math.floor(10000000 + Math.random() * 90000000).toString();

    const application = new Madrasa({
      ...data,
      trackingId,
      status: 'PENDING'
    });

    await application.save();

    return NextResponse.json({ success: true, trackingId }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to submit application:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
