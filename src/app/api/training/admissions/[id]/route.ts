import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrainingAdmission from '@/lib/models/TrainingAdmission';
import { getUserSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const admission = await TrainingAdmission.findById(id).lean();
    if (!admission) {
      return NextResponse.json({ success: false, error: 'আবেদন খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const formatted = {
      ...admission,
      id: (admission as any)._id.toString()
    };

    return NextResponse.json({ success: true, admission: formatted });
  } catch (error: any) {
    console.error('Error fetching admission details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'অননুমোদিত অ্যাক্সেস' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const allowedFields = [
      'status',
      'rollNo',
      'adminNote',
      'batchId',
      'batchName',
      'medium',
      'applicantName',
      'applicantNameEn',
      'fatherName',
      'motherName',
      'phone',
      'emergencyPhone',
      'nidOrBirthCert',
      'dateOfBirth',
      'bloodGroup',
      'gender',
      'education',
      'currentMadrasa',
      'division',
      'district',
      'upazila',
      'union',
      'village',
      'postOffice',
      'paymentMethod',
      'transactionId',
      'paymentAmount',
      'paymentPhone',
      'photoUrl'
    ];

    const updateData: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updated = await TrainingAdmission.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'আবেদন খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const formatted = {
      ...updated,
      id: (updated as any)._id.toString()
    };

    return NextResponse.json({ success: true, admission: formatted, message: 'আবেদন সফলভাবে আপডেট হয়েছে' });
  } catch (error: any) {
    console.error('Error updating admission:', error);
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

    await TrainingAdmission.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'আবেদন সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error: any) {
    console.error('Error deleting admission:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
