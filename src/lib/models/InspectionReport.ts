import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInspectionReport extends Document {
  applicationId: mongoose.Types.ObjectId;
  trackingNo: string;
  inspectorId: mongoose.Types.ObjectId;
  inspectorName: string;
  inspectorPhone?: string;
  phase: "phase_1" | "phase_2" | "phase_3"; // ১ম, ২য়, ৩য় পর্যায়
  inspectionDate: Date;
  
  // 11 General Checklist Points
  generalChecklist: Record<string, any>;
  
  // Subject × Class Matrix
  subjectMatrix: Record<string, Record<string, string>>;
  
  // Teachers and Students Stats
  teacherStats: {
    total: number;
    present: number;
  };
  studentStats: {
    play?: number;
    nursery?: number;
    class_1?: number;
    class_2?: number;
    class_3?: number;
    class_4?: number;
    class_5?: number;
    total: number;
  };
  
  // Scoring
  totalScore: number;
  grade: "GRADE_A" | "GRADE_B" | "GRADE_C" | "UNAPPROVED";
  gradeLabel?: string;
  
  // Observations and Signature
  inspectorRemarks?: string;
  signatureUrl?: string;
  
  // Anti-fraud & GPS Verification
  submissionLat?: number;
  submissionLng?: number;
  gpsDistanceMeters?: number;
  isGeofenceBreached: boolean;
  geofenceBreachReason?: string;
  photos: {
    type: string;
    url: string;
    timestamp?: string;
  }[];
  
  isLocked: boolean;
  adminReviewStatus: "PENDING" | "APPROVED" | "REVISION_REQUIRED" | "REJECTED";
  adminRemarks?: string;
  issuedMadrasahCode?: string;
  
  verificationHash?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const InspectionReportSchema = new Schema<IInspectionReport>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "InspectionApplication", required: true, index: true },
    trackingNo: { type: String, required: true, index: true },
    inspectorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    inspectorName: { type: String, required: true },
    inspectorPhone: { type: String },
    phase: { type: String, enum: ["phase_1", "phase_2", "phase_3"], default: "phase_1" },
    inspectionDate: { type: Date, default: Date.now },
    
    generalChecklist: { type: Schema.Types.Mixed, required: true },
    subjectMatrix: { type: Schema.Types.Mixed, required: true },
    
    teacherStats: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
    },
    studentStats: {
      play: { type: Number, default: 0 },
      nursery: { type: Number, default: 0 },
      class_1: { type: Number, default: 0 },
      class_2: { type: Number, default: 0 },
      class_3: { type: Number, default: 0 },
      class_4: { type: Number, default: 0 },
      class_5: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    
    totalScore: { type: Number, default: 0 },
    grade: { type: String, enum: ["GRADE_A", "GRADE_B", "GRADE_C", "UNAPPROVED"], default: "UNAPPROVED" },
    gradeLabel: { type: String },
    
    inspectorRemarks: { type: String },
    signatureUrl: { type: String },
    
    submissionLat: { type: Number },
    submissionLng: { type: Number },
    gpsDistanceMeters: { type: Number, default: 0 },
    isGeofenceBreached: { type: Boolean, default: false },
    geofenceBreachReason: { type: String },
    photos: [
      {
        type: { type: String },
        url: { type: String },
        timestamp: { type: String },
      },
    ],
    
    isLocked: { type: Boolean, default: true },
    adminReviewStatus: { 
      type: String, 
      enum: ["PENDING", "APPROVED", "REVISION_REQUIRED", "REJECTED"], 
      default: "PENDING" 
    },
    adminRemarks: { type: String },
    issuedMadrasahCode: { type: String },
    
    verificationHash: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

const InspectionReport: Model<IInspectionReport> =
  mongoose.models.InspectionReport ||
  mongoose.model<IInspectionReport>("InspectionReport", InspectionReportSchema);

export default InspectionReport;
