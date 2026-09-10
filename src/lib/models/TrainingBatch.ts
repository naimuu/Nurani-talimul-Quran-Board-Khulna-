import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITrainingBatch extends Document {
  medium: string; // 'bangla' | 'arabic'
  title: string;
  subtitle?: string;
  badge?: string;
  durationDays: string;
  durationText?: string;
  price: string;
  location: string;
  date: string;
  batch: string;
  phone: string;
  link?: string;
  regLink?: string;
  coverImage?: string;
  muallimId?: string;
  muallimName?: string;
  muallimDesignation?: string;
  muallimPhone?: string;
  muallimPhoto?: string;
  muallimTiming?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingBatchSchema = new Schema<ITrainingBatch>(
  {
    medium: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    badge: { type: String, default: '' },
    durationDays: { type: String, default: '' },
    durationText: { type: String, default: 'দিন মেয়াদী প্রশিক্ষণ' },
    price: { type: String, default: '' },
    location: { type: String, default: '' },
    date: { type: String, default: '' },
    batch: { type: String, required: true },
    phone: { type: String, required: true },
    link: { type: String, default: '' },
    regLink: { type: String, default: '/register' },
    coverImage: { type: String, default: '' },
    muallimId: { type: Schema.Types.ObjectId, ref: 'Muallim', default: null },
    muallimName: { type: String, default: '' },
    muallimDesignation: { type: String, default: '' },
    muallimPhone: { type: String, default: '' },
    muallimPhoto: { type: String, default: '' },
    muallimTiming: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TrainingBatch: Model<ITrainingBatch> =
  mongoose.models.TrainingBatch || mongoose.model<ITrainingBatch>('TrainingBatch', TrainingBatchSchema);

export default TrainingBatch;
