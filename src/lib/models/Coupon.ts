import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  isValid: boolean;
  message: string;
  usageLimit?: number; // null for unlimited
  usedCount: number;
  singleUse: boolean;
  usedBy: mongoose.Types.ObjectId[]; // Track which users used it
  applicableCourses?: mongoose.Types.ObjectId[]; // null for all courses
  minimumAmount?: number;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ["percentage", "fixed"], required: true },
  value: { type: Number, required: true, min: 0 },
  isValid: { type: Boolean, default: true },
  message: { type: String },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  singleUse: { type: Boolean, default: false },
  usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  applicableCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  minimumAmount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
CouponSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
CouponSchema.index({ code: 1 });
CouponSchema.index({ isValid: 1, expiresAt: 1 });

export default mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);
