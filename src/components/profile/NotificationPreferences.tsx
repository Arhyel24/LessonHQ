"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const NotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    referralUpdates: true,
    courseAlerts: true,
    promotionalEmails: false
  });

  const handleToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // Auto-save notification preferences
    toast({
      title: "Preferences Updated",
      description: "Your notification settings have been saved.",
    });
  };

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
              onCheckedChange={(value) => handleToggle("referralUpdates", value)}
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
              onCheckedChange={(value) => handleToggle("courseAlerts", value)}
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
              onCheckedChange={(value) => handleToggle("promotionalEmails", value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
