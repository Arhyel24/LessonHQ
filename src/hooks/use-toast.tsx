// lib/use-toast.ts
"use client";

import { toast as sonnerToast } from "sonner";
import {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Trash2,
} from "lucide-react";
import React from "react";

type ToastVariant =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; className: string }
> = {
  default: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    className: "bg-white dark:bg-zinc-900 text-black dark:text-white",
  },
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    className:
      "bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-100",
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    className: "bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    className:
      "bg-yellow-50 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    className: "bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-100",
  },
  destructive: {
    icon: <Trash2 className="h-5 w-5 text-white" />,
    className: "bg-red-600 text-white",
  },
};

export function toast({
  title,
  description,
  variant = "default",
  action,
}: ToastOptions) {
  const { icon, className } = variantConfig[variant];

  return sonnerToast.custom(() => (
    <div
      className={`flex items-start gap-3 rounded-lg p-4 shadow-lg ${className}`}
    >
      <div className="pt-1">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm opacity-80">{description}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  ));
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string) => sonnerToast.dismiss(id),
  };
}
