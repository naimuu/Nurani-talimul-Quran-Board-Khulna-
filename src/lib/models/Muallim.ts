import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMuallim extends Document {
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  nid?: string;
  gender: string; // 'পুরুষ' | 'মহিলা'
  designation: string; // e.g. 'প্রধান মুয়াল্লিম ও প্রশিক্ষক', 'সহকারী প্রশিক্ষক', 'নূরানী শিক্ষক'
  specialty?: string; // e.g. 'ক্বিরাত ও তাজবীদ', 'বাংলা পাঠদান পদ্ধতি', 'হাতের লেখা ও ক্যালিগ্রাফি'
  education?: string; // e.g. 'দাওরায়ে হাদীস, বেফাকুল মাদারিস'
  trainingDetails?: string; // e.g. 'বোর্ড শিক্ষক প্রশিক্ষণ কোর্স (ব্যাচ নং ৪৫), বিশেষ ক্বিরাত প্রশিক্ষণ'
  experienceYears?: string; // e.g. '৮ বছর'
  address?: string; // Full address
  division?: string; // Division
  district?: string; // District
  upazila?: string; // Upazila
  union?: string; // Union
  village?: string; // Village / Area
  photoUrl?: string; // Photo / avatar URL
  status: 'ACTIVE' | 'INACTIVE'; // সক্রিয় / নিষ্ক্রিয়
  notes?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MuallimSchema = new Schema<IMuallim>(
  {
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    altPhone: { type: String, default: '' },
    email: { type: String, default: '' },
    nid: { type: String, default: '' },
    gender: { type: String, default: 'পুরুষ' },
    designation: { type: String, default: 'মুয়াল্লিম ও শিক্ষক প্রশিক্ষক', index: true },
    specialty: { type: String, default: '' },
    education: { type: String, default: '' },
    trainingDetails: { type: String, default: '' },
    experienceYears: { type: String, default: '' },
    address: { type: String, default: '' },
    division: { type: String, default: 'খুলনা' },
    district: { type: String, default: 'খুলনা' },
    upazila: { type: String, default: '' },
    union: { type: String, default: '' },
    village: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    notes: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Muallim: Model<IMuallim> =
  mongoose.models.Muallim || mongoose.model<IMuallim>('Muallim', MuallimSchema);

export default Muallim;
