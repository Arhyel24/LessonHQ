import mongoose, { Schema, Document } from "mongoose";

export type FilterType = "all" | "in-progress" | "completed" | "not-started";

export interface ILesson {
  title: string;
  videoUrl: string;
  textContent: string;
  duration?: number; // Duration in minutes
  order?: number;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  icon?: string;
  price: number;
  originalPrice?: number;
  lessons: ILesson[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  instructor: string;
  rating?: number;
  enrollmentCount: number;
  status: "draft" | "published" | "archived";
  requiresCompletionForDownload: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  textContent: { type: String, required: true },
  duration: { type: Number, default: 10 },
  order: { type: Number },
});

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  icon: { type: String, default: "📚" },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  lessons: { type: [LessonSchema], required: true },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Intermediate",
  },
  instructor: { type: String, default: "LearnHQ Team" },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  enrollmentCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
  },
  requiresCompletionForDownload: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
CourseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
CourseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
