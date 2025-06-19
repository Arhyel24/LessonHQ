"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import myImageLoader from "@/lib/loader";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type SignupForm = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const urlRef = searchParams.get("ref");
    const storedRef = localStorage.getItem("ref");

    if (urlRef) {
      if (storedRef !== urlRef) {
        localStorage.setItem("ref", urlRef);
        setReferrer(urlRef);
        toast({
          title: "Referral Detected",
          description: `You were referred by ${urlRef}.`,
          variant: "info",
        });
      } else {
        setReferrer(storedRef);
      }
    } else if (storedRef) {
      setReferrer(storedRef);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        action: "signup",
        email: data.email,
        password: data.password,
        name: data.fullName,
        ref: referrer || "",
      });

      if (res?.ok) {
        toast({
          title: "Signup Successful",
          description: "Welcome! Redirecting to your dashboard.",
          variant: "success",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Signup Failed",
          description: res?.error || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup Error",
        description: (error as Error).message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google Login Failed",
        description:
          (error as Error).message ||
          "An unexpected error occurred during Google login.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="font-poppins font-bold text-2xl text-primary mb-2">
              LearnHQ
            </h1>
            <p className="font-nunito text-gray-600">
              Join thousands of Africans earning online
            </p>
          </div>

          {referrer && (
            <p className="text-sm font-nunito text-gray-700 mb-4">
              🎉 Awesome! You’re signing up with a referral from{" "}
              <strong>{referrer}</strong>. Thanks for joining through their
              link!
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="font-inter font-medium text-gray-700"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10 h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm font-nunito">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-inter font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm font-nunito">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-inter font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs font-nunito text-gray-500">
                Use at least 8 characters with uppercase letters and numbers
              </p>
              {errors.password && (
                <p className="text-red-500 text-sm font-nunito">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-inter font-semibold text-lg rounded-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 font-nunito text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Signup */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 font-inter font-semibold text-gray-700 rounded-xl transition-all duration-300"
          >
            <Image
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 mr-3"
              loader={myImageLoader}
              width={100}
              height={100}
              quality={75}
            />
            Continue with Google
          </Button>

          {/* Login Link */}
          <p className="text-center mt-6 font-nunito text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1920&h=1080&fit=crop&crop=center')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-blue-600/85 to-blue-800/90"></div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="font-poppins font-bold text-4xl mb-4">
              Start Your Journey!
            </h2>
            <p className="font-nunito text-xl text-blue-100">
              Join thousands learning to earn online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
