"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const PersonalInfoForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "Ada Okafor",
    email: "ada@example.com",
    phoneNumber: "+234 803 123 4567",
    dateOfBirth: "1995-03-15"
  });
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };

  const handleSave = () => {
    // TODO: API call to save changes
    console.log("Saving personal info:", formData);
    setIsChanged(false);
    toast({
      title: "Profile Updated",
      description: "Your personal information has been saved successfully.",
    });
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
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button 
            onClick={handleSave}
            disabled={!isChanged}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
