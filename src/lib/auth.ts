import bcrypt from 'bcryptjs';
import { generateUniqueReferralCode } from './generateReferralCode';
import User from './models/User';
import connectDB from './connectDB';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createUser(userData: {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  referredBy?: string;
  oauthProvider?: string;
  oauthId?: string;
  emailVerified?: Date;
}) {
  await connectDB();
  
  const referralCode = generateUniqueReferralCode();
  
  const newUser = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password ? await hashPassword(userData.password) : undefined,
    avatar: userData.avatar,
    referralCode,
    referredBy: userData.referredBy || null,
    oauthProvider: userData.oauthProvider,
    oauthId: userData.oauthId,
    emailVerified: userData.oauthProvider ? new Date() : undefined,
  });

  return await newUser.save();
}

export async function findUserByEmail(email: string) {
  await connectDB();
  return await User.findOne({ email: email.toLowerCase() });
}

export async function findUserById(id: string) {
  await connectDB();
  return await User.findById(id);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}