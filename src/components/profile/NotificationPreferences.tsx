"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNotificationPreferences } from "../notisDebounceSave";

export const NotificationPreferences = () => {
  const { toast } = useToast();
  const { preferences, handleToggle, setPreferences } =
    useNotificationPreferences();

  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  const mapFromApiFormat = (data: {
    email: {
      referralEarnings: boolean;
      courseUpdates: boolean;
      promotions: boolean;
    };
  }) => ({
    referralUpdates: data.email?.referralEarnings ?? true,
    courseAlerts: data.email?.courseUpdates ?? true,
    promotionalEmails: data.email?.promotions ?? false,
  });

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notification-preferences");
      const json = await res.json();
      if (json.success && json.data) {
        setPreferences(mapFromApiFormat(json.data));
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted.current) {
      fetchPreferences();
      mounted.current = true;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Referral Updates</Label>
              <p className="text-sm text-gray-600">
                Get notified when someone signs up using your referral link
              </p>
            </div>
            <Switch
              checked={preferences.referralUpdates}
              onCheckedChange={(v) => handleToggle("referralUpdates", v)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Course Completion Alerts</Label>
              <p className="text-sm text-gray-600">
                Receive notifications when you complete lessons and courses
              </p>
            </div>
            <Switch
              checked={preferences.courseAlerts}
              onCheckedChange={(v) => handleToggle("courseAlerts", v)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Promotional Emails</Label>
              <p className="text-sm text-gray-600">
                Stay updated with new courses, offers, and platform updates
              </p>
            </div>
            <Switch
              checked={preferences.promotionalEmails}
              onCheckedChange={(v) => handleToggle("promotionalEmails", v)}
              disabled={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
