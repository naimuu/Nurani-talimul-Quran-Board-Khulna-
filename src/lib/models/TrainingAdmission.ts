import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITrainingAdmission extends Document {
  trackingId: string;
  batchId?: mongoose.Types.ObjectId | string;
  batchName: string;
  medium: string; // 'bangla' | 'arabic'
  courseTitle: string;
  applicantName: string;
  applicantNameEn?: string;
  fatherName: string;
  motherName?: string;
  phone: string;
  emergencyPhone?: string;
  nidOrBirthCert?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  gender?: string;
  education: string;
  currentMadrasa?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  village?: string;
  postOffice?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentAmount?: string;
  paymentPhone?: string;
  photoUrl?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  adminNote?: string;
  rollNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingAdmissionSchema = new Schema<ITrainingAdmission>(
  {
    trackingId: { type: String, required: true, unique: true, index: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'TrainingBatch', default: null, index: true },
    batchName: { type: String, required: true },
    medium: { type: String, required: true, index: true },
    courseTitle: { type: String, required: true },
    applicantName: { type: String, required: true, index: true },
    applicantNameEn: { type: String, default: '' },
    fatherName: { type: String, required: true },
    motherName: { type: String, default: '' },
    phone: { type: String, required: true, index: true },
    emergencyPhone: { type: String, default: '' },
    nidOrBirthCert: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    gender: { type: String, default: 'পুরুষ' },
    education: { type: String, required: true },
    currentMadrasa: { type: String, default: '' },
    division: { type: String, default: '' },
    district: { type: String, default: '' },
    upazila: { type: String, default: '' },
    union: { type: String, default: '' },
    village: { type: String, default: '' },
    postOffice: { type: String, default: '' },
    paymentMethod: { type: String, default: 'বিকাশ' },
    transactionId: { type: String, default: '' },
    paymentAmount: { type: String, default: '' },
    paymentPhone: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    adminNote: { type: String, default: '' },
    rollNo: { type: String, default: '' }
  },
  { timestamps: true }
);

const TrainingAdmission: Model<ITrainingAdmission> =
  mongoose.models.TrainingAdmission ||
  mongoose.model<ITrainingAdmission>('TrainingAdmission', TrainingAdmissionSchema);

export default TrainingAdmission;
