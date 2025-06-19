import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Check required environment variables
const { SITE_NAME, ZOHO_USER, ZOHO_PASSWORD, ZOHO_HOST } = process.env;

if (!ZOHO_USER || !ZOHO_PASSWORD || !ZOHO_HOST) {
  throw new Error("Missing required email environment variables.");
}

const transporter = nodemailer.createTransport({
  host: ZOHO_HOST || "smtp.zoho.com",
  port: 465, // Use 587 for TLS (if 465 doesn't work)
  secure: true, // True for port 465, false for 587 (STARTTLS)
  auth: {
    user: ZOHO_USER,
    pass: ZOHO_PASSWORD,
  },
});

export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: `"${SITE_NAME || "LearnHQ"}" <${ZOHO_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

export async function sendSupportEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Support Request</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #374151; margin-top: 0;">Message:</h3>
        <p style="line-height: 1.6; color: #4b5563;">${data.message}</p>
      </div>
      <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #2563eb;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          This email was sent from the LearnHQ support form.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: process.env.ADMIN_EMAIL as string,
    subject: `Support Request: ${data.subject}`,
    html: htmlContent,
  });
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Welcome to LearnHQ!</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi ${userName},</p>
        <p>Welcome to the LearnHQ Platform! We're excited to have you join our community of learners.</p>
        <p>Here's what you can do next:</p>
        <ul style="line-height: 1.8;">
          <li>Browse our course catalog</li>
          <li>Purchase your first course</li>
          <li>Start learning and track your progress</li>
          <li>Earn certificates upon completion</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.SITE_URL || "http://localhost:3000"}/courses" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explore Courses
          </a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy learning!</p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The LearnHQ Team
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: "Welcome to LearnHQ!",
    html: htmlContent,
  });
}

/**
 * Send payment initialization email
 */
export async function sendPaymentInitializationEmail(
  email: string,
  name: string,
  paymentDetails: {
    courseTitle: string;
    originalAmount: number;
    finalAmount: number;
    discountAmount: number;
    couponCode?: string;
    paymentReference: string;
    paymentUrl?: string;
  }
): Promise<void> {
  const subject = `Payment Initialized - ${paymentDetails.courseTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">LearnHQ</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Payment Confirmation</p>
        </div>

        <!-- Main Content -->
        <h2 style="color: #1f2937; margin-bottom: 20px;">Payment Initialized Successfully!</h2>
        
        <p style="color: #374151; line-height: 1.6;">Hello ${name},</p>
        
        <p style="color: #374151; line-height: 1.6;">
          Your payment for <strong>"${
            paymentDetails.courseTitle
          }"</strong> has been initialized. 
          ${
            paymentDetails.finalAmount === 0
              ? "You have been automatically enrolled as this course is free!"
              : "Please complete your payment to access the course."
          }
        </p>

        <!-- Payment Details Card -->
        <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Course:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">${
                paymentDetails.courseTitle
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Original Price:</td>
              <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">$${paymentDetails.originalAmount.toFixed(
                2
              )}</td>
            </tr>
            ${
              paymentDetails.discountAmount > 0
                ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                Discount ${
                  paymentDetails.couponCode
                    ? `(${paymentDetails.couponCode})`
                    : ""
                }:
              </td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">-$${paymentDetails.discountAmount.toFixed(
                2
              )}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 12px 0 8px 0; color: #1f2937; font-weight: 600; font-size: 16px;">Total Amount:</td>
              <td style="padding: 12px 0 8px 0; color: #2563eb; font-weight: 700; font-size: 18px; text-align: right;">
                ${
                  paymentDetails.finalAmount === 0
                    ? "FREE"
                    : `$${paymentDetails.finalAmount.toFixed(2)}`
                }
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>Payment Reference:</strong> ${
                paymentDetails.paymentReference
              }
            </p>
          </div>
        </div>

        ${
          paymentDetails.finalAmount > 0 && paymentDetails.paymentUrl
            ? `
        <!-- Payment Action -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentDetails.paymentUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Complete Payment
          </a>
        </div>
        `
            : ""
        }

        ${
          paymentDetails.finalAmount === 0
            ? `
        <!-- Free Course Message -->
        <div style="background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #166534; font-weight: 600;">
            🎉 Congratulations! You have been automatically enrolled in this course.
          </p>
        </div>
        `
            : ""
        }

        <!-- Next Steps -->
        <div style="margin-top: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">What's Next?</h3>
          <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
            ${
              paymentDetails.finalAmount === 0
                ? `
            <li>Access your course immediately from your dashboard</li>
            <li>Start learning at your own pace</li>
            <li>Track your progress and earn certificates</li>
            `
                : `
            <li>Complete your payment using the link above</li>
            <li>You'll receive another email once payment is confirmed</li>
            <li>Access your course immediately after payment</li>
            `
            }
          </ul>
        </div>

        <!-- Support -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Need help? Contact our support team at 
            <a href="mailto:support@micplatform.com" style="color: #2563eb;">support@micplatform.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong>The LearnHQ Team</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  paymentDetails: {
    courseTitle: string;
    originalAmount: number;
    finalAmount: number;
    discountAmount: number;
    couponCode?: string;
    paymentReference: string;
    paidAt: Date;
    courseId: string;
  }
): Promise<void> {
  const subject = `Payment Successful - Welcome to ${paymentDetails.courseTitle}!`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">LearnHQ</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Payment Confirmation</p>
        </div>

        <!-- Success Message -->
        <div style="background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: #166534; margin: 0 0 10px 0; font-size: 24px;">🎉 Payment Successful!</h2>
          <p style="color: #166534; margin: 0; font-size: 16px;">Welcome to your new course!</p>
        </div>

        <p style="color: #374151; line-height: 1.6;">Hello ${name},</p>
        
        <p style="color: #374151; line-height: 1.6;">
          Congratulations! Your payment has been successfully processed and you now have full access to 
          <strong>"${paymentDetails.courseTitle}"</strong>.
        </p>

        <!-- Payment Summary -->
        <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Payment Summary</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Course:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">${
                paymentDetails.courseTitle
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Original Price:</td>
              <td style="padding: 8px 0; color: #1f2937; border-bottom: 1px solid #e5e7eb; text-align: right;">$${paymentDetails.originalAmount.toFixed(
                2
              )}</td>
            </tr>
            ${
              paymentDetails.discountAmount > 0
                ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">
                Discount ${
                  paymentDetails.couponCode
                    ? `(${paymentDetails.couponCode})`
                    : ""
                }:
              </td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">-$${paymentDetails.discountAmount.toFixed(
                2
              )}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 12px 0 8px 0; color: #1f2937; font-weight: 600; font-size: 16px;">Amount Paid:</td>
              <td style="padding: 12px 0 8px 0; color: #2563eb; font-weight: 700; font-size: 18px; text-align: right;">$${paymentDetails.finalAmount.toFixed(
                2
              )}</td>
            </tr>
          </table>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <table style="width: 100%; font-size: 14px; color: #6b7280;">
              <tr>
                <td><strong>Payment Reference:</strong></td>
                <td style="text-align: right;">${
                  paymentDetails.paymentReference
                }</td>
              </tr>
              <tr>
                <td><strong>Payment Date:</strong></td>
                <td style="text-align: right;">${paymentDetails.paidAt.toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Course Access -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/courses/${
    paymentDetails.courseId
  }" 
             style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
            Start Learning Now
          </a>
        </div>

        <!-- Course Benefits -->
        <div style="margin-top: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">What You Get:</h3>
          <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
            <li>Lifetime access to all course materials</li>
            <li>High-quality video lessons and resources</li>
            <li>Progress tracking and completion certificates</li>
            <li>Access to course updates and new content</li>
            <li>Community support and discussions</li>
          </ul>
        </div>

        <!-- Next Steps -->
        <div style="margin-top: 30px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">Getting Started:</h3>
          <ol style="color: #374151; line-height: 1.6; padding-left: 20px;">
            <li>Click the "Start Learning Now" button above</li>
            <li>Begin with the first lesson at your own pace</li>
            <li>Track your progress in your dashboard</li>
            <li>Complete all lessons to earn your certificate</li>
          </ol>
        </div>

        <!-- Receipt Notice -->
        <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 25px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            📧 <strong>Receipt:</strong> This email serves as your official receipt. Please keep it for your records.
          </p>
        </div>

        <!-- Support -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questions about your course? Contact our support team at 
            <a href="mailto:support@micplatform.com" style="color: #2563eb;">support@micplatform.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Thank you for choosing LearnHQ!<br>
            <strong>Happy Learning!</strong>
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

/*
/ Send email verification link
*/
export async function sendVerificationEmail(
  userEmail: string,
  userName: string
) {
  const token = jwt.sign(
    { email: userEmail },
    process.env.EMAIL_VERIFICATION_SECRET!,
    { expiresIn: "1d" }
  );

  const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/email-verification?token=${token}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Welcome to LearnHQ, ${userName}!</h2>
      <p>Thank you for signing up. Please verify your email address to activate your account.</p>
      <p style="margin: 20px 0;">
        <a 
          href="${verifyLink}"
          style="display: inline-block; padding: 12px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 4px;"
        >
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
      <hr />
      <p style="font-size: 12px; color: #777;">If you didn’t create an account on MIC, please ignore this email.</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: "Welcome to LearnHQ – Verify Your Email",
    text: `Hi ${userName},\n\nThank you for signing up. Please verify your email address by clicking the link below:\n\n${verifyLink}\n\nIf you didn't create an account, please ignore this email.`,
    html: htmlContent,
  });
}

/*
/ Send email verification success message
*/
export async function sendEmailVerifiedMessage(
  userEmail: string,
  userName: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Email Successfully Verified 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Your email has been successfully verified. You can now enjoy full access to all features on the LearnHQ.</p>
      <p>Welcome aboard and happy learning!</p>
      <hr />
      <p style="font-size: 12px; color: #777;">If you didn't verify your email, please contact support immediately.</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: "Your Email Has Been Verified – Welcome to MIC!",
    text: `Hi ${userName},\n\nYour email has been successfully verified. You can now enjoy full access to all features on the LearnHQ.\n\nWelcome aboard and happy learning!`,
    html: htmlContent,
  });
}
