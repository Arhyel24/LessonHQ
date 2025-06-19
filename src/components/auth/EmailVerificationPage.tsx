"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const EmailVerificationPage = () => {
  const { data: session, update, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedNow, setVerifiedNow] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      const response = await fetch("/api/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to resend verification email"
        );
      }

      setResendSuccess(true);
    } catch (error) {
      setResendError("Failed to resend verification email. Please try again.");
      console.error("Error resending verification email:", error);
    } finally {
      setIsResending(false);
    }
  };

  // Handle token verification
  useEffect(() => {
    const verifyToken = async () => {
      if (
        token &&
        status === "authenticated" &&
        session?.user?.emailVerified === false
      ) {
        setVerifying(true);
        try {
          const res = await fetch(`/api/verify-email?token=${token}`);
          const result = await res.json();

          if (res.ok && result.success) {
            setVerifiedNow(true);
            await update({ emailVerified: true });
          } else {
            console.error("Token verification failed:", result.error);
          }
        } catch (err) {
          console.error("Error verifying token:", err);
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyToken();
  }, [token, session, update, status]);

  // Redirect if already verified
  useEffect(() => {
    if (status === "authenticated" && session?.user?.emailVerified) {
      const timeout = setTimeout(() => {
        router.replace("/dashboard");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [session, status, router]);

  const isVerified = session?.user?.emailVerified || verifiedNow;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-md mx-auto px-4">
          <Link href="/" className="inline-block">
            <h1 className="font-poppins font-bold text-xl text-primary">
              LearnHQ
            </h1>
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 text-center">
        {verifying ? (
          <>
            <RefreshCw className="h-10 w-10 animate-spin text-gray-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800">
              Verifying your email...
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Please wait while we confirm your email address.
            </p>
          </>
        ) : isVerified ? (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-6" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Your email is verified!
            </h1>
            <p className="text-gray-600 mb-4">
              You can now access all features of your account.
            </p>
            <Button
              onClick={() => router.replace("/dashboard")}
              className="w-full h-10"
            >
              Go to Dashboard
            </Button>
          </>
        ) : (
          <>
            <Mail className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-2xl font-normal text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-gray-600">
              We&apos;ve sent a verification link to your email address.
            </p>

            <div className="space-y-4 mb-8 mt-6 text-sm text-gray-700">
              <p>
                To continue, please check your inbox and click the verification
                link.
              </p>
              <p>
                <strong>Don&apos;t see it?</strong> Check your spam or junk
                folder.
              </p>
            </div>

            {resendSuccess && (
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 font-nunito">
                  Verification email sent successfully! Please check your inbox.
                </AlertDescription>
              </Alert>
            )}

            {resendError && (
              <Alert
                className="border-red-200 bg-red-50 mb-6"
                variant="destructive"
              >
                <AlertDescription className="font-nunito">
                  {resendError}
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-8">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full h-10 bg-gray-50 border border-gray-300 text-gray-900 hover:bg-gray-100 font-normal text-sm"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Not your account?{" "}
              <button
                onClick={() => signOut()}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Log out
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help?{" "}
            <Link
              href="/help"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
