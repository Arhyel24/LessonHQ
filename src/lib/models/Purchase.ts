import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentReference: string;
  paymentProvider?: "paystack" | "flutterwave";
  paidAt?: Date;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  paymentReference: { type: String, required: true, unique: true },
  paymentProvider: {
    type: String,
    enum: ["paystack", "flutterwave"],
    default: "paystack",
  },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries
PurchaseSchema.index({ user: 1, course: 1 });
PurchaseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
