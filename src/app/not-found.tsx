"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/"); // Redirect to home
  }, [router]);

  return null;
}
// This component will redirect users to the home page immediately