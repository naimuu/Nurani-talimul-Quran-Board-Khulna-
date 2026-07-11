import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);

export default Notice;
