import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationPreferences {
  email: {
    courseUpdates: boolean;
    promotions: boolean;
    referralEarnings: boolean;
    supportReplies: boolean;
    systemAnnouncements: boolean;
  };
  push: {
    courseUpdates: boolean;
    promotions: boolean;
    referralEarnings: boolean;
    supportReplies: boolean;
    systemAnnouncements: boolean;
  };
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  email: string;
  password?: string;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  role: "student" | "admin";
  notificationPreferences?: INotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
  oauthProvider?: "google";
  oauthId?: string;
  emailVerified?: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    email: {
      courseUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      referralEarnings: { type: Boolean, default: true },
      supportReplies: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true },
    },
    push: {
      courseUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      referralEarnings: { type: Boolean, default: true },
      supportReplies: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    avatar: {
      type: String,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    referredBy: {
      type: String,
      default: null,
    },
    referralEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    notificationPreferences: {
      type: NotificationPreferencesSchema,
      default: undefined,
    },
    oauthProvider: {
      type: String,
      enum: ["google"],
    },
    oauthId: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default UserModel;
