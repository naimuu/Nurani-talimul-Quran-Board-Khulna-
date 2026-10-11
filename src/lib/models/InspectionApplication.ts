import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInspectionApplication extends Document {
  trackingNo: string;
  madrasaId?: mongoose.Types.ObjectId;
  applicantUserId?: mongoose.Types.ObjectId;
  
  madrasahName: string;
  madrasahCode?: string; // M Code
  aCode?: string; // A Code
  mCode?: string; // M Code
  establishedYear?: string;
  division: string;
  district: string;
  upazila: string;
  union?: string;
  postOffice?: string;
  village?: string;
  fullAddress?: string;
  directorName: string;
  directorMobile: string;
  altMobile?: string;
  headTeacherName?: string;
  headTeacherMobile?: string;
  madrasaType?: string;
  totalStudents?: number;
  totalTeachers?: number;
  highestClass?: string;
  isPreviouslyInspected?: boolean;
  lastInspectionDate?: Date;
  inspectionReason?: string;
  applicantRemarks?: string;
  academicYearCe: string;
  academicYearHijri?: string;
  
  inspectionType: string;
  status: "SUBMITTED" | "PAID" | "ASSIGNED" | "SCHEDULED" | "INSPECTED" | "APPROVED" | "REVISION_REQUIRED" | "REJECTED";
  targetDate?: Date;
  
  registeredLat?: number;
  registeredLng?: number;
  
  feeAmount: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentTrxId?: string;
  paymentMethod?: string;
  
  assignedInspectorId?: mongoose.Types.ObjectId;
  assignedInspectorName?: string;
  assignedInspectorPhone?: string;

  createdAt: Date;
  updatedAt: Date;
}

const InspectionApplicationSchema = new Schema<IInspectionApplication>(
  {
    trackingNo: { type: String, required: true, unique: true, index: true },
    madrasaId: { type: Schema.Types.ObjectId, ref: "Madrasa", index: true },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User" },
    
    madrasahName: { type: String, required: true },
    madrasahCode: { type: String },
    aCode: { type: String },
    mCode: { type: String },
    establishedYear: { type: String },
    division: { type: String, default: "খুলনা" },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    union: { type: String },
    postOffice: { type: String },
    village: { type: String },
    fullAddress: { type: String },
    directorName: { type: String, required: true },
    directorMobile: { type: String, required: true },
    altMobile: { type: String },
    headTeacherName: { type: String },
    headTeacherMobile: { type: String },
    madrasaType: { type: String, default: "নূরানী সাধারণ" },
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    highestClass: { type: String, default: "৩য় শ্রেণি" },
    isPreviouslyInspected: { type: Boolean, default: false },
    lastInspectionDate: { type: Date },
    inspectionReason: { type: String },
    applicantRemarks: { type: String },
    academicYearCe: { type: String, default: "2026" },
    academicYearHijri: { type: String },
    
    inspectionType: { 
      type: String, 
      enum: ["new_elhak", "regular_annual", "re_inspection", "code_allocation", "exam_center", "training_center", "special_investigation"],
      default: "new_elhak" 
    },
    status: { 
      type: String, 
      enum: ["SUBMITTED", "PAID", "ASSIGNED", "SCHEDULED", "INSPECTED", "APPROVED", "REVISION_REQUIRED", "REJECTED"],
      default: "SUBMITTED" 
    },
    targetDate: { type: Date },
    
    registeredLat: { type: Number },
    registeredLng: { type: Number },
    
    feeAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "REFUNDED"], default: "PENDING" },
    paymentTrxId: { type: String },
    paymentMethod: { type: String },
    
    assignedInspectorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    assignedInspectorName: { type: String },
    assignedInspectorPhone: { type: String },
  },
  { timestamps: true }
);

const InspectionApplication: Model<IInspectionApplication> =
  mongoose.models.InspectionApplication ||
  mongoose.model<IInspectionApplication>("InspectionApplication", InspectionApplicationSchema);

export default InspectionApplication;
