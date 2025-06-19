"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { ICourseTransformed } from "@/types/Course";
import Image from "next/image";
import PaystackPop from "@paystack/inline-js";

interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  isValid: boolean;
  message?: string;
}

const CoursePayment = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [course, setCourse] = useState<ICourseTransformed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course/getbyslug/${slug}`);
        if (!res.ok) throw new Error("Not found");

        const json = await res.json();
        if (!json.data) throw new Error("No course data");

        console.log("Course data:", json);

        if (json.data.isEnrolled) router.push(`/course/${slug}/lessons`);

        setCourse(json.data);
      } catch (error) {
        console.error("Error loading course:", error);
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading course details...
      </div>
    );
  }

  if (!course) return null; // Shouldn't reach here, but just in case

  const calculateFinalPrice = () => {
    if (!appliedCoupon) return course.price;

    if (appliedCoupon.type === "percentage") {
      return Math.max(
        0,
        course.price - (course.price * appliedCoupon.value) / 100
      );
    } else {
      return Math.max(0, course.price - appliedCoupon.value);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);

    try {
      const res = await fetch("/api/coupon/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          couserId: course.id,
          amount: course.price,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data.isValid) {
        const coupon: Coupon = {
          code: json.data.code,
          type: json.data.type,
          value: json.data.value,
          isValid: true,
        };

        setAppliedCoupon(coupon);

        toast({
          title: "Coupon Applied!",
          description: json.data.message,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: json.data.message || "The coupon code is not valid.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error verifying coupon:", err);
      toast({
        title: "Error",
        description: "Something went wrong while verifying the coupon.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Coupon Removed",
      description: "The coupon has been removed from your order.",
    });
  };

  const handlePayment = async () => {
    const courseId = course?.id;
    if (!courseId) return;

    setIsProcessingPayment(true);

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          couponCode: couponCode?.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast({
          title: "Payment Failed",
          description: json.message || "Unable to process your purchase.",
          variant: "destructive",
        });
        return;
      }

      const { data } = json;

      if (!data) {
        toast({
          title: "Invalid Server Response",
          description: "Server returned success without payment data.",
          variant: "destructive",
        });
        return;
      }      

      console.log("Payment data:", json)

      if (data.enrolled) {
        // Free enrollment successful
        toast({
          title: "Enrolled Successfully!",
          description: "You now have access to the course. Redirecting...",
        });
        setTimeout(() => {
          router.push(`/course/${slug}/lesson`);
        }, 2000);
      // } else if (data.accessCode) {
      //   // Use Paystack popup
      //   const popup = new PaystackPop();
      //   popup.resumeTransaction(data.accessCode);
      } else if (data.paymentUrl) {
        // Paid course, redirect to Paystack
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Unknown Payment Response",
          description: "Could not determine the payment status.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const finalPrice = calculateFinalPrice();
  const discount = course.price - finalPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 mt-2">
            Secure checkout for your course enrollment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                    width={80}
                    height={80}
                    quality={80}
                    loader={({ src }) => src}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Instructor: {course.instructor}</span>
                      <span>Duration: {course.duration}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-medium mb-2">What you&apos;ll learn:</h4>
                  <ul className="space-y-1">
                    {course.modules.slice(0, 7).map((module, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {module}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Have a Coupon?
                </CardTitle>
                <CardDescription>
                  Apply a coupon code for discounts or free access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        {appliedCoupon.code}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.value}% OFF`
                          : `₦${appliedCoupon.value} OFF`}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="coupon">Coupon Code</Label>
                      <Input
                        id="coupon"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || isApplyingCoupon}
                      >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Course Price</span>
                    <span
                      className={
                        appliedCoupon ? "line-through text-gray-400" : ""
                      }
                    >
                      ₦{course.price.toLocaleString()}
                    </span>
                  </div>

                  {course.originalPrice && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Original Price</span>
                      <span className="line-through">
                        ₦{course.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₦{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className={finalPrice === 0 ? "text-green-600" : ""}>
                      {finalPrice === 0
                        ? "FREE"
                        : `₦${finalPrice.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <Separator className="my-6" />

                <Button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessingPayment
                    ? "Processing..."
                    : finalPrice === 0
                    ? "Enroll for Free"
                    : "Complete Payment"}
                </Button>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    Secure payment powered by Paystack
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePayment;
