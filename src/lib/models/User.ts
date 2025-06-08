import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  email: string;
  password?: string;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  role: 'student' | 'admin';
  referralNotis: boolean;
  courseNotis: boolean;
  promotionNotis: boolean;
  createdAt: Date;
  updatedAt: Date;
  oauthProvider?: string;
  oauthId?: string;
  emailVerified?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String,
    minlength: 6
  },
  avatar: { 
    type: String 
  },
  referralCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  referredBy: { 
    type: String,
    default: null 
  },
  referralEarnings: { 
    type: Number, 
    default: 0,
    min: 0
  },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student' 
  },
  oauthProvider: { 
    type: String,
    enum: ['google']
  },
  oauthId: { 
    type: String 
  },
  emailVerified: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);