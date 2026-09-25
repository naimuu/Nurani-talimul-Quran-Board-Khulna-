import mongoose, { Document, Model, Schema } from "mongoose";
import { GENERAL_CHECKLIST_ITEMS, STANDARD_INSPECTION_SUBJECTS } from "@/lib/inspectionUtils";

export interface IChecklistOption {
  value: string;
  label: string;
  points: number; // Supports positive (+marks) and negative (-marks)
}

export interface IChecklistItem {
  id: string;
  sl: string;
  label: string;
  type: "yes_no_partial" | "good_moderate_weak" | "numeric" | "custom_select";
  options?: IChecklistOption[];
}

export interface IInspectionConfig extends Document {
  version: number;
  isActive: boolean;
  checklistItems: IChecklistItem[];
  subjects?: Array<{
    id: string;
    sl: string;
    name: string;
  }>;
  updatedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionConfigSchema = new Schema<IInspectionConfig>(
  {
    version: { type: Number, default: 1, required: true },
    isActive: { type: Boolean, default: true, index: true },
    checklistItems: {
      type: Array as any,
      default: () => JSON.parse(JSON.stringify(GENERAL_CHECKLIST_ITEMS)),
    },
    subjects: {
      type: Array as any,
      default: () => JSON.parse(JSON.stringify(STANDARD_INSPECTION_SUBJECTS)),
    },
    updatedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const InspectionConfig: Model<IInspectionConfig> =
  mongoose.models.InspectionConfig ||
  mongoose.model<IInspectionConfig>("InspectionConfig", InspectionConfigSchema);

export default InspectionConfig;
