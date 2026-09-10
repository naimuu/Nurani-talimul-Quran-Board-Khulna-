import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrainingAdmission from '@/lib/models/TrainingAdmission';
import TrainingBatch from '@/lib/models/TrainingBatch';
import { getUserSession } from '@/lib/auth';

function generateTrackingId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `NBK-TR-${year}-${rand}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const medium = searchParams.get('medium');
    const batchId = searchParams.get('batchId');
    const search = searchParams.get('search');

    const andConditions: any[] = [];

    if (status && status !== 'ALL') {
      andConditions.push({ status });
    }
    if (medium && medium !== 'ALL') {
      andConditions.push({ medium: medium.toLowerCase() });
    }
    if (batchId && batchId !== 'ALL') {
      andConditions.push({
        $or: [
          { batchId: batchId },
          { batchName: batchId }
        ]
      });
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { trackingId: searchRegex },
          { applicantName: searchRegex },
          { applicantNameEn: searchRegex },
          { phone: searchRegex },
          { fatherName: searchRegex },
          { batchName: searchRegex },
          { currentMadrasa: searchRegex },
          { district: searchRegex },
          { transactionId: searchRegex }
        ]
      });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    const admissions = await TrainingAdmission.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate aggregated counts
    const [total, pending, accepted, rejected] = await Promise.all([
      TrainingAdmission.countDocuments({}),
      TrainingAdmission.countDocuments({ status: 'PENDING' }),
      TrainingAdmission.countDocuments({ status: 'ACCEPTED' }),
      TrainingAdmission.countDocuments({ status: 'REJECTED' })
    ]);

    // Calculate batch-wise counts
    const batchCounts = await TrainingAdmission.aggregate([
      {
        $group: {
          _id: { batchName: '$batchName', batchId: '$batchId', medium: '$medium' },
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } }
        }
      }
    ]);

    const formatted = admissions.map(a => ({
      ...a,
      id: (a as any)._id ? (a as any)._id.toString() : (a as any).id
    }));

    return NextResponse.json({
      success: true,
      admissions: formatted,
      counts: {
        total,
        pending,
        accepted,
        rejected,
        batchCounts: batchCounts.map(b => ({
          batchName: b._id.batchName,
          batchId: b._id.batchId ? b._id.batchId.toString() : '',
          medium: b._id.medium,
          total: b.total,
          accepted: b.accepted,
          pending: b.pending,
          rejected: b.rejected
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      batchId,
      batchName,
      medium,
      courseTitle,
      applicantName,
      applicantNameEn,
      fatherName,
      motherName,
      phone,
      emergencyPhone,
      nidOrBirthCert,
      dateOfBirth,
      bloodGroup,
      gender,
      education,
      currentMadrasa,
      division,
      district,
      upazila,
      union,
      village,
      postOffice,
      paymentMethod,
      transactionId,
      paymentAmount,
      paymentPhone,
      photoUrl
    } = body;

    if (!applicantName || !fatherName || !phone || !education || !batchName) {
      return NextResponse.json(
        { success: false, error: 'নাম, পিতার নাম, মোবাইল নম্বর, শিক্ষাগত যোগ্যতা এবং ব্যাচ নির্বাচন আবশ্যক।' },
        { status: 400 }
      );
    }

    let finalBatchName = batchName;
    let finalMedium = medium || 'bangla';
    let finalCourseTitle = courseTitle || 'মুয়াল্লিম প্রশিক্ষণ';

    // If batchId is provided, fetch batch details to ensure consistency
    if (batchId) {
      try {
        const foundBatch = await TrainingBatch.findById(batchId).lean();
        if (foundBatch) {
          finalBatchName = foundBatch.batch;
          finalMedium = foundBatch.medium;
          finalCourseTitle = foundBatch.title;
        }
      } catch (err) {
        // Continue with provided values
      }
    }

    const trackingId = generateTrackingId();

    const newAdmission = await TrainingAdmission.create({
      trackingId,
      batchId: batchId || null,
      batchName: finalBatchName,
      medium: finalMedium,
      courseTitle: finalCourseTitle,
      applicantName: applicantName.trim(),
      applicantNameEn: (applicantNameEn || '').trim(),
      fatherName: fatherName.trim(),
      motherName: (motherName || '').trim(),
      phone: phone.trim(),
      emergencyPhone: (emergencyPhone || '').trim(),
      nidOrBirthCert: (nidOrBirthCert || '').trim(),
      dateOfBirth: (dateOfBirth || '').trim(),
      bloodGroup: (bloodGroup || '').trim(),
      gender: (gender || 'পুরুষ').trim(),
      education: education.trim(),
      currentMadrasa: (currentMadrasa || '').trim(),
      division: (division || '').trim(),
      district: (district || '').trim(),
      upazila: (upazila || '').trim(),
      union: (union || '').trim(),
      village: (village || '').trim(),
      postOffice: (postOffice || '').trim(),
      paymentMethod: (paymentMethod || 'বিকাশ').trim(),
      transactionId: (transactionId || '').trim(),
      paymentAmount: (paymentAmount || '').trim(),
      paymentPhone: (paymentPhone || '').trim(),
      photoUrl: (photoUrl || '').trim(),
      status: 'PENDING'
    });

    const formatted = {
      ...newAdmission.toObject(),
      id: newAdmission._id.toString()
    };

    return NextResponse.json({
      success: true,
      message: 'ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে!',
      trackingId,
      admission: formatted
    });
  } catch (error: any) {
    console.error('Error creating training admission:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
