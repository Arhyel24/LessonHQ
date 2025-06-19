import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/connectDB";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import Course from "@/lib/models/Course";
import Coupon from "@/lib/models/Coupon";
import mongoose from "mongoose";
import { createActivity } from "@/lib/utils/activityHelper";
import { sendPaymentSuccessEmail } from "@/lib/sendEmail";
import User from "@/lib/models/User";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "charge.success") {
    return NextResponse.json(
      { message: "Not a charge.success event" },
      { status: 200 }
    );
  }

  const paymentData = event.data;
  const { reference, amount, paid_at } = paymentData;

  await connectDB();

  const purchase = await Purchase.findOne({
    paymentReference: reference,
  }).populate("course user");

  if (!purchase) {
    console.error("Purchase not found for reference:", reference);
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (purchase.status === "completed") {
    return NextResponse.json(
      { message: "Purchase already completed" },
      { status: 200 }
    );
  }

  if (amount / 100 !== purchase.amount) {
    console.error(
      "Amount mismatch. Expected:",
      purchase.amount,
      "Received:",
      amount / 100
    );
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const couponCode = purchase.data?.couponCode;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (coupon) {
      const userIdStr = purchase.user._id.toString();

      const alreadyUsed = coupon.usedBy.some(
        (id: mongoose.Types.ObjectId) => id.toString() === userIdStr
      );

      if (!alreadyUsed) {
        coupon.usedBy.push(purchase.user._id);
        coupon.usedCount = (coupon.usedCount ?? 0) + 1;
        await coupon.save();
      }
    } else {
      console.warn(`⚠️ Coupon code "${couponCode}" not found in database.`);
    }
  }

  purchase.status = "completed";
  purchase.paidAt = paid_at;
  await purchase.save();

  await Progress.create({
    user: purchase.user._id,
    course: purchase.course._id,
    lessonsCompleted: [],
    percentage: 0,
  });

  await Course.findByIdAndUpdate(purchase.course._id, {
    $inc: { enrollmentCount: 1 },
  });

  const user = await User.findById(purchase.user._id);
  if (!user) {
    console.warn(`User not found for ID: ${purchase.user._id}`);
    return;
  }

  if (user.referredBy) {
    const referrer = await User.findOne({ referralCode: user.referredBy });
  
    if (referrer) {
      const earning = Math.round(purchase.amount * 0.3); // 30% of course price
  
      referrer.referralEarnings = (referrer.referralEarnings || 0) + earning;
  
      await referrer.save();

      await createActivity({
        userId: referrer._id.toString(),
        type: "referral_earned",
        title: "Referral Bonus Earned!",
        message: `You earned ₦${earning} for referring ${
          user.name || user.email
        } to purchase "${purchase.course.title}".`,
        data: {
          referredUserId: user._id,
          referredUserEmail: user.email,
          courseId: purchase.course._id,
          courseTitle: purchase.course.title,
          amountEarned: earning,
          purchaseAmount: purchase.amount,
        },
        priority: "medium",
        category: "referral",
        actionUrl: `/earnings`,
      });
    } else {
      console.warn(`Referrer not found for code: ${user.referredBy}`);
    }
  }

  await createActivity({
    userId: user._id.toString(),
    type: "course_purchased",
    title: "Course Purchased Successfully!",
    message: `You have successfully purchased "${purchase.course.title}" for ₦${purchase.amount}. You can now access all course content.`,
    data: {
      courseId: purchase.course._id,
      courseTitle: purchase.course.title,
      amount: purchase.amount,
      originalAmount: purchase.data?.originalAmount,
      discountAmount: purchase.data?.discountAmount,
      couponCode: purchase.data?.couponCode,
    },
    priority: "high",
    category: "course",
    actionUrl: `/courses/${purchase.course.slug}`,
  });

  try {
    await sendPaymentSuccessEmail(user.email, user.name, {
      courseTitle: purchase.course.title,
      originalAmount: purchase.data?.originalAmount ?? purchase.amount,
      finalAmount: purchase.amount,
      discountAmount: purchase.data?.discountAmount ?? 0,
      couponCode: purchase.data?.couponCode,
      paymentReference: purchase.paymentReference,
      paidAt: purchase.paidAt,
      courseId: purchase.course._id.toString(),
    });
  } catch (err) {
    console.error("❌ Failed to send payment success email:", err);
    // Email failure should not break payment flow
  }

  console.log(
    `✅ User ${purchase.user.email} enrolled in course: ${purchase.course.title}`
  );

  return NextResponse.json(
    { message: "Payment verified and purchase completed" },
    { status: 200 }
  );
}
