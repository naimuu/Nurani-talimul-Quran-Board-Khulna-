import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuestionSet {
  _id?: mongoose.Types.ObjectId;
  itemCode?: string; // Unique English item ID handler (e.g. QS-SEM1-CLS1-A7F2)
  classId?: string;  // Unique English class ID handler (e.g. cls_1, cls_shishu)
  className: string;
  setName: string;
  pricePerSet: number;
  centerDiscountPercent?: number;
  centerDiscountAmount?: number;
  effectiveCenterPrice?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: string;
  details?: string;
  subjects?: string[];
  instructions?: string;
  isActive: boolean;
  orderCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamItem {
  _id?: mongoose.Types.ObjectId;
  examId?: string; // Unique English exam ID handler
  code?: string;   // Unique English exam code handler (e.g. SEM-1, ANNUAL)
  name: string;
  examTerm?: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  questionSets: IQuestionSet[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamSession extends Document {
  sessionYear: string;
  title?: string;
  isDefault?: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  exams: IExamItem[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSetSchema = new Schema<IQuestionSet>(
  {
    itemCode: { type: String, index: true },
    classId: { type: String, index: true },
    className: { type: String, required: true },
    setName: { type: String, required: true },
    pricePerSet: { type: Number, required: true, default: 0 },
    centerDiscountPercent: { type: Number, default: 0 },
    centerDiscountAmount: { type: Number, default: 0 },
    effectiveCenterPrice: { type: Number, default: 0 },
    attachmentUrl: { type: String },
    attachmentName: { type: String },
    attachmentSize: { type: String },
    details: { type: String },
    subjects: [{ type: String }],
    instructions: { type: String },
    isActive: { type: Boolean, default: true },
    orderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ExamItemSchema = new Schema<IExamItem>(
  {
    examId: { type: String, index: true },
    code: { type: String, index: true },
    name: { type: String, required: true },
    examTerm: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'UPCOMING', 'COMPLETED'],
      default: 'ACTIVE',
    },
    questionSets: [QuestionSetSchema],
  },
  { timestamps: true }
);

const ExamSessionSchema = new Schema<IExamSession>(
  {
    sessionYear: { type: String, required: true, unique: true },
    title: { type: String },
    isDefault: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    exams: [ExamItemSchema],
  },
  { timestamps: true }
);

const ExamSession: Model<IExamSession> =
  mongoose.models.ExamSession || mongoose.model<IExamSession>('ExamSession', ExamSessionSchema);

export default ExamSession;
