"use client";

import { useEffect, useState } from "react";
import { CheckCircle, BookOpen, Users, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RawActivity {
  id: string;
  type: "course" | "referral" | "achievement";
  title: string;
  time: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    activities: RawActivity[];
    pagination: object;
    unreadCount: number;
  };
}

interface Activity extends RawActivity {
  icon: ForwardRefExoticComponent<LucideProps>;
}

export const RecentActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const iconMap: Record<string, ForwardRefExoticComponent<LucideProps>> = {
    course: BookOpen,
    referral: Users,
    achievement: CheckCircle,
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/activity");
        const json: ApiResponse = await res.json();

        if (!res.ok || !json.success) {
          throw new Error("Failed to load activities.");
        }

        const enrichedActivities: Activity[] = json.data.activities
          .slice(0, 5)
          .map((item) => ({
            ...item,
            icon: iconMap[item.type] || CheckCircle,
          }));

        setActivities(enrichedActivities);
      } catch (err) {
        console.error("Unable to fetch recent activity:", err);
      }
    };

    fetchActivities();
  }, []);

  const getActivityColor = (type: string) => {
    switch (type) {
      case "course":
        return "bg-primary/10 text-primary";
      case "referral":
        return "bg-green-100 text-green-600";
      case "achievement":
        return "bg-accent/20 text-accent";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins font-semibold text-lg text-gray-900">
          Recent Activity
        </h2>
        <Link href="/activities">
          <Button
            variant="ghost"
            className="text-sm font-inter text-primary hover:underline"
          >
            View All
          </Button>
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                  activity.type
                )}`}
              >
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm text-gray-900 mb-1">
                  {activity.title}
                </p>
                <p className="font-nunito text-xs text-gray-500">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="font-nunito text-gray-500 text-sm">
            No recent activity yet. Start learning to see your progress here!
          </p>
        </div>
      )}
    </div>
  );
};
