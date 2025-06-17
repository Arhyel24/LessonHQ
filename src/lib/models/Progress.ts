import mongoose, { Schema, Document } from "mongoose";

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lessonsCompleted: string[];
  percentage: number;
  completedAt?: Date;
  certificateIssued: boolean;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  lessonsCompleted: { type: [String], default: [] },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  certificateIssued: { type: Boolean, default: false },
  lastAccessedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index to ensure one progress record per user per course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

// Update the updatedAt field on save
ProgressSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Progress ||
  mongoose.model<IProgress>("Progress", ProgressSchema);
