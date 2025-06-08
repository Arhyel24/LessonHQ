import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lessonsCompleted: number[];
  percentage: number;
  completedAt?: Date;
  certificateIssued: boolean;
  lastAccessedAt: Date;
  timeSpent: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
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
  lessonsCompleted: { 
    type: [Number], 
    default: [] 
  },
  percentage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  completedAt: { 
    type: Date 
  },
  certificateIssued: { 
    type: Boolean, 
    default: false 
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
ProgressSchema.index({ user: 1 });
ProgressSchema.index({ course: 1 });
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });
ProgressSchema.index({ percentage: 1 });

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);