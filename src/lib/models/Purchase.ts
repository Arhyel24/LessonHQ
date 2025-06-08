import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentReference: string;
  paymentProvider: 'paystack' | 'flutterwave';
  paidAt?: Date;
  refundedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentReference: { 
    type: String, 
    required: true,
    unique: true
  },
  paymentProvider: {
    type: String,
    enum: ['paystack', 'flutterwave'],
    required: true
  },
  paidAt: { 
    type: Date 
  },
  refundedAt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
PurchaseSchema.index({ user: 1 });
PurchaseSchema.index({ course: 1 });
PurchaseSchema.index({ paymentReference: 1 });
PurchaseSchema.index({ status: 1 });
PurchaseSchema.index({ user: 1, course: 1 }, { unique: true }); // One purchase per user per course

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);