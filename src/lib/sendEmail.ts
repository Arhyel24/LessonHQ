import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Check required environment variables
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, SITE_NAME } =
  process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error("Missing required email environment variables.");
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT, 10),
  secure: parseInt(EMAIL_PORT, 10) === 465, // true for port 465
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: `"${SITE_NAME || "MIC Platform"}" <${EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.messageId);
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
          This email was sent from the MIC Platform support form.
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
        <h1 style="margin: 0;">Welcome to MIC Platform!</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi ${userName},</p>
        <p>Welcome to the Massive Income Course Platform! We're excited to have you join our community of learners.</p>
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
          The MIC Platform Team
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: "Welcome to MIC Platform!",
    html: htmlContent,
  });
}
