import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type:
    | "course_purchased"
    | "lesson_completed"
    | "course_completed"
    | "certificate_issued"
    | "referral_earned"
    | "payment_received"
    | "support_ticket_created"
    | "support_ticket_replied"
    | "payout_requested"
    | "payout_completed"
    | "system_announcement"
    | "course_added"
    | "profile_updated"
    | "password_changed"
    | "login_success"
    | "login_failed"
    | "course_reviewed";
  title: string;  
  message: string;
  data?: any; // Additional context data
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "course"
    | "payment"
    | "referral"
    | "support"
    | "system"
    | "security";
  actionUrl?: string; // URL to navigate when notification is clicked
  expiresAt?: Date; // For temporary notifications
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "course_purchased",
      "lesson_completed",
      "course_completed",
      "certificate_issued",
      "referral_earned",
      "payment_received",
      "support_ticket_created",
      "support_ticket_replied",
      "payout_requested",
      "payout_completed",
      "system_announcement",
      "course_added",
      "profile_updated",
      "password_changed",
      "login_success",
      "login_failed",
      "course_reviewed",
    ],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  category: {
    type: String,
    enum: ["course", "payment", "referral", "support", "system", "security"],
    required: true,
  },
  actionUrl: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

ActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);