import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMadrasa extends Document {
  name: string;
  englishName?: string;
  instituteType?: string;
  managedBy?: string;
  managerName?: string;
  email?: string;
  registrationDate?: string;
  phone1?: string;
  phone2?: string;
  
  // Address
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  village?: string;
  postOffice?: string;
  postCode?: string;
  wardNo?: string;
  addressDetails?: string;

  teachers: {
    name: string;
    phone: string;
    designation: string;
  }[];

  code?: string;
  trackingId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const MadrasaSchema = new Schema<IMadrasa>(
  {
    name: { type: String, required: true },
    englishName: { type: String },
    instituteType: { type: String },
    managedBy: { type: String },
    managerName: { type: String },
    email: { type: String },
    registrationDate: { type: String },
    phone1: { type: String },
    phone2: { type: String },

    division: { type: String },
    district: { type: String },
    upazila: { type: String },
    union: { type: String },
    village: { type: String },
    postOffice: { type: String },
    postCode: { type: String },
    wardNo: { type: String },
    addressDetails: { type: String },

    teachers: [
      {
        name: { type: String },
        phone: { type: String },
        designation: { type: String },
      }
    ],

    code: { type: String, unique: true, sparse: true },
    trackingId: { type: String, unique: true, sparse: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED'], 
      default: 'PENDING' 
    },
  },
  { timestamps: true }
);

// We need to handle the case where code might be empty string instead of null, 
// because unique index on sparse will fail if there are multiple empty strings.
// A pre-save hook to set empty strings to undefined for sparse indexes.
MadrasaSchema.pre('save', function (next) {
  if (this.code === "") this.code = undefined;
  if (this.trackingId === "") this.trackingId = undefined;
  next();
});

const Madrasa: Model<IMadrasa> =
  mongoose.models.Madrasa || mongoose.model<IMadrasa>('Madrasa', MadrasaSchema);

export default Madrasa;
