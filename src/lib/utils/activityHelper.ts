import Activity from '@/lib/models/Activity';
import { IActivity } from '@/lib/models/Activity';

export interface CreateActivityData {
  userId: string;
  type: IActivity['type'];
  title: string;
  message: string;
  data?: any;
  priority?: IActivity['priority'];
  category: IActivity['category'];
  actionUrl?: string;
  expiresAt?: Date;
}

/**
 * Helper function to create activities/notifications
 */
export async function createActivity(activityData: CreateActivityData): Promise<IActivity> {
  try {
    const activity = new Activity({
      user: activityData.userId,
      type: activityData.type,
      title: activityData.title,
      message: activityData.message,
      data: activityData.data,
      priority: activityData.priority || 'medium',
      category: activityData.category,
      actionUrl: activityData.actionUrl,
      expiresAt: activityData.expiresAt
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Failed to create activity:', error);
    throw error;
  }
}

/**
 * Create course purchase activity
 */
export async function createCoursePurchaseActivity(
  userId: string,
  courseTitle: string,
  amount: number,
  courseId: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'course_purchased',
    title: 'Course Purchased Successfully!',
    message: `You have successfully purchased "${courseTitle}" for $${amount}. You can now access all course content.`,
    data: { courseId, amount, courseTitle },
    priority: 'high',
    category: 'course',
    actionUrl: `/courses/${courseId}`
  });
}

/**
 * Create lesson completion activity
 */
export async function createLessonCompletionActivity(
  userId: string,
  courseTitle: string,
  lessonTitle: string,
  courseId: string,
  lessonIndex: number
): Promise<void> {
  await createActivity({
    userId,
    type: 'lesson_completed',
    title: 'Lesson Completed!',
    message: `You have completed "${lessonTitle}" in "${courseTitle}". Keep up the great work!`,
    data: { courseId, courseTitle, lessonTitle, lessonIndex },
    priority: 'medium',
    category: 'course',
    actionUrl: `/courses/${courseId}`
  });
}

/**
 * Create course completion activity
 */
export async function createCourseCompletionActivity(
  userId: string,
  courseTitle: string,
  courseId: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'course_completed',
    title: 'Course Completed! 🎉',
    message: `Congratulations! You have completed "${courseTitle}". Your certificate is now available for download.`,
    data: { courseId, courseTitle },
    priority: 'high',
    category: 'course',
    actionUrl: `/courses/${courseId}/certificate`
  });
}

/**
 * Create certificate issued activity
 */
export async function createCertificateIssuedActivity(
  userId: string,
  courseTitle: string,
  courseId: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'certificate_issued',
    title: 'Certificate Available!',
    message: `Your certificate for "${courseTitle}" is ready for download. Congratulations on your achievement!`,
    data: { courseId, courseTitle },
    priority: 'high',
    category: 'course',
    actionUrl: `/courses/${courseId}/certificate`
  });
}

/**
 * Create referral earning activity
 */
export async function createReferralEarningActivity(
  userId: string,
  amount: number,
  referredUserName: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'referral_earned',
    title: 'Referral Commission Earned!',
    message: `You earned $${amount} commission from ${referredUserName}'s course purchase. Keep sharing to earn more!`,
    data: { amount, referredUserName },
    priority: 'high',
    category: 'referral',
    actionUrl: '/referrals'
  });
}

/**
 * Create support ticket activity
 */
export async function createSupportTicketActivity(
  userId: string,
  ticketId: string,
  subject: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'support_ticket_created',
    title: 'Support Ticket Created',
    message: `Your support ticket "${subject}" has been created. We'll respond within 24 hours.`,
    data: { ticketId, subject },
    priority: 'medium',
    category: 'support',
    actionUrl: `/support/tickets/${ticketId}`
  });
}

/**
 * Create support ticket reply activity
 */
export async function createSupportTicketReplyActivity(
  userId: string,
  ticketId: string,
  subject: string,
  isStaffReply: boolean = true
): Promise<void> {
  await createActivity({
    userId,
    type: 'support_ticket_replied',
    title: isStaffReply ? 'Support Team Replied' : 'Ticket Updated',
    message: isStaffReply 
      ? `Our support team has replied to your ticket "${subject}". Please check your ticket for the response.`
      : `Your reply has been added to ticket "${subject}". Our team will respond soon.`,
    data: { ticketId, subject, isStaffReply },
    priority: isStaffReply ? 'high' : 'medium',
    category: 'support',
    actionUrl: `/support/tickets/${ticketId}`
  });
}

/**
 * Create payout request activity
 */
export async function createPayoutRequestActivity(
  userId: string,
  amount: number,
  payoutId: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'payout_requested',
    title: 'Payout Request Submitted',
    message: `Your payout request for $${amount} has been submitted and is being processed. You'll receive an update soon.`,
    data: { amount, payoutId },
    priority: 'medium',
    category: 'referral',
    actionUrl: '/referrals/payouts'
  });
}

/**
 * Create payout completed activity
 */
export async function createPayoutCompletedActivity(
  userId: string,
  amount: number,
  payoutId: string
): Promise<void> {
  await createActivity({
    userId,
    type: 'payout_completed',
    title: 'Payout Completed! 💰',
    message: `Your payout of $${amount} has been successfully processed and sent to your account.`,
    data: { amount, payoutId },
    priority: 'high',
    category: 'referral',
    actionUrl: '/referrals/payouts'
  });
}

/**
 * Create system announcement activity
 */
export async function createSystemAnnouncementActivity(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string,
  expiresAt?: Date
): Promise<void> {
  await createActivity({
    userId,
    type: 'system_announcement',
    title,
    message,
    priority: 'medium',
    category: 'system',
    actionUrl,
    expiresAt
  });
}

/**
 * Create bulk system announcements for all users
 */
export async function createBulkSystemAnnouncement(
  userIds: string[],
  title: string,
  message: string,
  actionUrl?: string,
  expiresAt?: Date
): Promise<void> {
  const activities = userIds.map(userId => ({
    user: userId,
    type: 'system_announcement' as const,
    title,
    message,
    priority: 'medium' as const,
    category: 'system' as const,
    actionUrl,
    expiresAt
  }));

  await Activity.insertMany(activities);
}

const activityUtils = {
  createActivity,
  createCoursePurchaseActivity,
  createLessonCompletionActivity,
  createCourseCompletionActivity,
  createCertificateIssuedActivity,
  createReferralEarningActivity,
  createSupportTicketActivity,
  createSupportTicketReplyActivity,
  createPayoutRequestActivity,
  createPayoutCompletedActivity,
  createSystemAnnouncementActivity,
  createBulkSystemAnnouncement,
};

export default activityUtils;