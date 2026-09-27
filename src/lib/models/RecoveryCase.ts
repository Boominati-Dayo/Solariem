import mongoose, { Schema, Document } from 'mongoose';

export interface IRecoveryUpdate {
  status: string;
  message: string;
  timestamp: Date;
}

export interface IRecoveryCase extends Document {
  userId?: mongoose.Types.ObjectId;
  claimNumber: string;
  isPublic: boolean;
  email?: string;
  phone?: string;
  address?: string;
  scamType: string;
  amountLost: number;
  currency: string;
  dateOfIncident: string;
  platformName: string;
  details: string;
  status: 'pending' | 'investigating' | 'forensic_phase' | 'legal_action' | 'funds_frozen' | 'approved' | 'completed' | 'rejected';
  adminNotes?: string;
  amountClaimed?: number;
  serviceFee?: number;
  unblockFee?: number;
  feePaid: boolean;
  screenshotUrl?: string;
  updates: IRecoveryUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const RecoveryUpdateSchema = new Schema<IRecoveryUpdate>({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const RecoveryCaseSchema = new Schema<IRecoveryCase>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  claimNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  },
  isPublic: { type: Boolean, default: false },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  scamType: { type: String, required: true },
  amountLost: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  dateOfIncident: { type: String, required: true },
  platformName: { type: String, required: true },
  details: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'forensic_phase', 'legal_action', 'funds_frozen', 'approved', 'completed', 'rejected'],
    default: 'pending'
  },
  adminNotes: { type: String },
  amountClaimed: { type: Number },
  serviceFee: { type: Number },
  unblockFee: { type: Number },
  feePaid: { type: Boolean, default: false },
  screenshotUrl: { type: String },
  updates: [RecoveryUpdateSchema],
}, {
  timestamps: true
});

export default mongoose.models.RecoveryCase || mongoose.model<IRecoveryCase>('RecoveryCase', RecoveryCaseSchema);
