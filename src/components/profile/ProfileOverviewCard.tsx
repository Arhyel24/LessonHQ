"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Camera } from "lucide-react";

export const ProfileOverviewCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Ada Okafor");
  const [email] = useState("ada@example.com");

  const handleSave = () => {
    setIsEditing(false);
    // TODO: API call to save changes
    console.log("Saving profile changes:", { name });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                AO
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-md"
                />
              ) : (
                <p className="font-medium text-gray-900">{name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <p className="text-gray-600">{email}</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <p className="text-gray-600">Student</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
