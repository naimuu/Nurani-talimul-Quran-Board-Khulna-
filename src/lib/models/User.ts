import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: string;
  madrasaId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    phone: { type: String, unique: true, sparse: true },
    role: { type: String, default: 'GENERAL' },
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa' },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
