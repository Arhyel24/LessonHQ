"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

export const PersonalInfoForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isChanged, setIsChanged] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error("Failed to load profile.");
        }

        const user = json.data;

        setFormData({
          fullName: user.name || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: user.dateOfBirth?.slice(0, 10) || "",
        });
      } catch (err) {
        toast({
          title: "Error",
          description:
            (err as Error).message || "Could not fetch user profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };

  const handleSave = async () => {
    setIsChanging(true);
    try {
      const res = await fetch("/api/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to update profile");

      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved successfully.",
        variant: "success",
      });
      setIsChanged(false);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    readOnly
                    className="cursor-not-allowed"
                  />
                </TooltipTrigger>
                <TooltipContent>Only editable by admin</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="cursor-not-allowed"
                  />
                </TooltipTrigger>
                <TooltipContent>Only editable by admin</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="Enter your phone number"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={!isChanged || loading}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {isChanging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
