"use client";

import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { useToast } from "@/hooks/use-toast";

export type UIPreferences = {
  referralUpdates: boolean;
  courseAlerts: boolean;
  promotionalEmails: boolean;
};

// Helper: Convert UI preferences to API format
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
  const [preferences, setPreferences] = useState({
    referralUpdates: true,
    courseAlerts: true,
    promotionalEmails: false,
  });

  const savePreferences = useCallback(
    debounce(async (newPrefs: typeof preferences) => {
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
        console.log("Error saving preference:", err);
        // Optional: rollback if needed
        setPreferences((prev) => ({ ...prev }));
      }
    }, 500),
    [] // important: empty dependency means it won't re-debounce every render
  );

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferences(updated);
  };

  return { preferences, handleToggle, setPreferences };
};
