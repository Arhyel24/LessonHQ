"use client";

import { toast } from "@/hooks/use-toast";

export default function ToastTestPage() {
  const variants = [
    "default",
    "success",
    "info",
    "warning",
    "error",
    "destructive",
  ] as const;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-zinc-900 px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
        Sonner Toast Variant Tester
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
        {variants.map((variant) => (
          <button
            key={variant}
            onClick={() =>
              toast({
                title: `${variant.toUpperCase()} Toast`,
                description: `This is a "${variant}" variant notification.`,
                variant,
              })
            }
            className={`py-2 px-4 rounded-md font-medium text-white transition-all ${
              variant === "default"
                ? "bg-zinc-800"
                : variant === "success"
                ? "bg-green-600"
                : variant === "info"
                ? "bg-blue-600"
                : variant === "warning"
                ? "bg-yellow-500 text-black"
                : variant === "error"
                ? "bg-red-600"
                : variant === "destructive"
                ? "bg-red-800"
                : "bg-gray-600"
            }`}
          >
            Show {variant}
          </button>
        ))}
      </div>
    </main>
  );
}
