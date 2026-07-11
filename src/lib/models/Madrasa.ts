import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMadrasa extends Document {
  name: string;
  address: string;
  code: string;
  contactNo?: string;
  principalName?: string;
  district?: string;
  upazila?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MadrasaSchema = new Schema<IMadrasa>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    contactNo: { type: String },
    principalName: { type: String },
    district: { type: String },
    upazila: { type: String },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Madrasa: Model<IMadrasa> =
  mongoose.models.Madrasa || mongoose.model<IMadrasa>('Madrasa', MadrasaSchema);

export default Madrasa;
