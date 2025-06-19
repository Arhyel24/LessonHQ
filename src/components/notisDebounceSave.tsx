"use client";

import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { useToast } from "@/hooks/use-toast";

export type UIPreferences = {
  referralUpdates: boolean;
  courseAlerts: boolean;
  promotionalEmails: boolean;
};

const mapToApiFormat = (prefs: UIPreferences) => ({
  email: {
    referralEarnings: prefs.referralUpdates,
    courseUpdates: prefs.courseAlerts,
    promotions: prefs.promotionalEmails,
    supportReplies: true,
    systemAnnouncements: true,
  },
  push: {
    referralEarnings: prefs.referralUpdates,
    courseUpdates: prefs.courseAlerts,
    promotions: prefs.promotionalEmails,
    supportReplies: true,
    systemAnnouncements: true,
  },
});

export const useNotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UIPreferences>({
    referralUpdates: true,
    courseAlerts: true,
    promotionalEmails: false,
  });

  const debouncedSavePreferences = useMemo(
    () =>
      debounce(async (newPrefs: UIPreferences) => {
        try {
          const res = await fetch("/api/user/notification-preferences", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ preferences: mapToApiFormat(newPrefs) }),
          });

          if (!res.ok) throw new Error("Failed to update preferences");

          toast({
            title: "Preferences Updated",
            description: "Your notification settings have been saved.",
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to update notification preferences.",
            variant: "destructive",
          });
          console.error("Error saving preference:", err);
          setPreferences((prev) => ({ ...prev })); // optional rollback
        }
      }, 500),
    [toast]
  );

  useEffect(() => {
    return () => {
      debouncedSavePreferences.cancel?.();
    };
  }, [debouncedSavePreferences]);

  const handleToggle = (key: keyof UIPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    debouncedSavePreferences(updated);
  };

  return { preferences, handleToggle, setPreferences };
};
