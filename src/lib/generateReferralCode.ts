export function generateReferralCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

export function generateUniqueReferralCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}${random}`;
}

/**
 * Generate referral code from user name
 */
export function generateReferralCodeFromName(name: string, suffix?: string): string {
  // Take first 3 characters of name and add random suffix
  const namePrefix = name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
  const randomSuffix = suffix || Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return namePrefix + randomSuffix;
}

export default generateReferralCode;