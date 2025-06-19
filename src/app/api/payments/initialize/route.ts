import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import Coupon, { ICoupon } from "@/lib/models/Coupon";
import { createActivity } from "@/lib/utils/activityHelper";
import { sendPaymentInitializationEmail } from "@/lib/sendEmail";
import https from "https";

// ========== Coupon Helper ==========
async function validateCoupon(
  code: string,
  userId: string,
  course: any
): Promise<{
  valid: boolean;
  coupon?: ICoupon;
  discount: number;
  errors?: string[];
}> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon)
    return { valid: false, discount: 0, errors: ["Invalid coupon code"] };

  const errors: string[] = [];
  if (!coupon.isValid) errors.push(coupon.message || "Coupon is invalid");
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    errors.push("Coupon expired");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    errors.push("Usage limit reached");
  if (coupon.singleUse && coupon.usedBy.includes(userId))
    errors.push("Coupon already used");
  if (coupon.minimumAmount && course.price < coupon.minimumAmount)
    errors.push(`Minimum amount of ₦${coupon.minimumAmount} required`);
  if (
    coupon.applicableCourses?.length &&
    !coupon.applicableCourses.includes(course._id)
  )
    errors.push("Coupon not applicable to this course");

  if (errors.length) return { valid: false, discount: 0, errors };

  const discount =
    coupon.type === "percentage"
      ? Math.round((course.price * coupon.value) / 100)
      : Math.min(coupon.value, course.price);

  return { valid: true, coupon, discount };
}

// ========== Paystack Init ==========
function initializePaystackTransaction(
  email: string,
  amount: number
): Promise<any> {
  const payload = JSON.stringify({ email, amount });
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.status) return reject(parsed.message || "Paystack error");
          resolve(parsed.data);
        } catch (err) {
          reject((err as Error).message ?? "Failed to parse Paystack response");
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ========== Main Handler ==========
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { courseId, couponCode } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!courseId)
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );

    const course = await Course.findById(courseId);
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const existingPurchase = await Purchase.findOne({
      user: user._id,
      course: courseId,
      status: { $in: ["completed", "pending"] },
    });

    if (existingPurchase) {
      if (existingPurchase.status === "completed") {
        return NextResponse.json(
          { error: "Course already purchased" },
          { status: 400 }
        );
      }

      let returnData: any = {};
      const existingCouponCode = existingPurchase.data?.couponCode;

      const couponIsValid =
        existingCouponCode &&
        (await validateCoupon(existingCouponCode, String(user._id), course))
          .valid;

      if (couponIsValid) {
        returnData = {
          paymentUrl: existingPurchase.data?.paymentUrl,
          reference: existingPurchase.paymentReference,
          originalAmount: course.price,
          finalAmount: existingPurchase.price,
          discountAmount: existingPurchase.data?.discountAmount || 0,
          accessCode: existingPurchase.data?.accessCode,
          couponApplied: existingCouponCode,
        };
      } else {
        const paystack = await initializePaystackTransaction(
          session.user.email,
          course.price * 100
        );

        // Update existing purchase with new transaction data
        existingPurchase.paymentReference = paystack.reference;
        existingPurchase.price = course.price;
        existingPurchase.data = {
          paymentUrl: paystack.authorization_url,
          accessCode: paystack.access_code,
          finalAmount: course.price,
          couponCode: null,
          discountAmount: null,
        };
        await existingPurchase.save();

        returnData = {
          paymentUrl: paystack.authorization_url,
          reference: paystack.reference,
          originalAmount: course.price,
          finalAmount: course.price,
          discountAmount: null,
          accessCode: paystack.access_code,
          couponApplied: null,
        };
      }

      return NextResponse.json({
        success: true,
        message: "Payment already initiated",
        data: returnData,
      });
    }

    let discountAmount = 0;
    let appliedCoupon: ICoupon | null = null;

    if (couponCode) {
      const result = await validateCoupon(couponCode, String(user._id), course);
      if (!result.valid) {
        return NextResponse.json(
          { error: result.errors?.join(", ") },
          { status: 400 }
        );
      }
      discountAmount = result.discount;
      appliedCoupon = result.coupon!;
    }

    const finalAmount = Math.max(0, course.price - discountAmount);

    // Free Enrollment Path
    if (finalAmount === 0) {
      const purchase = await Purchase.create({
        user: user._id,
        course: courseId,
        amount: course.price,
        status: "completed",
        paymentReference: `FREE-${Date.now()}-${courseId}`,
        paidAt: new Date(),
      });

      await Progress.create({
        user: user._id,
        course: courseId,
        lessonsCompleted: [],
        percentage: 0,
      });
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 },
      });

      if (appliedCoupon) {
        appliedCoupon.usedCount += 1;
        if (!appliedCoupon.usedBy.includes(user._id))
          appliedCoupon.usedBy.push(user._id);
        if (
          appliedCoupon.singleUse ||
          (appliedCoupon.usageLimit &&
            appliedCoupon.usedCount >= appliedCoupon.usageLimit)
        ) {
          appliedCoupon.isValid = false;
          appliedCoupon.message = "Coupon used";
        }
        await appliedCoupon.save();
      }

      await createActivity({
        userId: user._id.toString(),
        type: "course_purchased",
        title: "Course Enrolled Successfully!",
        message: `You enrolled in "${course.title}"${
          appliedCoupon ? ` with coupon ${appliedCoupon.code}` : " for free"
        }.`,
        data: {
          courseId,
          courseTitle: course.title,
          originalAmount: course.price,
          finalAmount,
          discountAmount,
          couponCode: appliedCoupon?.code,
          freeEnrollment: true,
        },
        priority: "high",
        category: "course",
        actionUrl: `/courses`,
      });

      if (user.referredBy) {
        const referrer = await User.findOne({ referralCode: user.referredBy });

        if (referrer) {
          const earning = Math.round(purchase.amount * 0.3); // 30% of course price

          referrer.referralEarnings =
            (referrer.referralEarnings || 0) + earning;

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

      await sendPaymentInitializationEmail(user.email, user.name, {
        courseTitle: course.title,
        originalAmount: course.price,
        finalAmount: 0,
        discountAmount,
        couponCode: appliedCoupon?.code,
        paymentReference: purchase.paymentReference,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        message: "Successfully enrolled in course!",
        data: {
          enrolled: true,
          originalAmount: course.price,
          finalAmount,
          discountAmount,
          couponApplied: appliedCoupon?.code,
        },
      });
    }

    // Paid Enrollment Path
    const paystack = await initializePaystackTransaction(
      user.email,
      finalAmount * 100
    );
    await Purchase.create({
      user: user._id,
      course: courseId,
      amount: finalAmount,
      status: "pending",
      paymentReference: paystack.reference,
      paymentProvider: "paystack",
      data: {
        paymentUrl: paystack.authorization_url,
        accessCode: paystack.access_code,
        couponCode: appliedCoupon?.code,
        originalAmount: course.price,
        discountAmount,
      },
    });

    await sendPaymentInitializationEmail(user.email, user.name, {
      courseTitle: course.title,
      originalAmount: course.price,
      finalAmount,
      discountAmount,
      couponCode: appliedCoupon?.code,
      paymentReference: paystack.reference,
      paymentUrl: paystack.authorization_url,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        paymentUrl: paystack.authorization_url,
        reference: paystack.reference,
        originalAmount: course.price,
        finalAmount,
        discountAmount,
        accessCode: paystack.access_code,
        couponApplied: appliedCoupon?.code,
      },
    });
  } catch (err) {
    console.error("Error initializing payment:", err);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
