"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

export const ProfileOverviewCard = () => {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
      setInitialName(session.user.name);
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("api/user/update-username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error("Failed to update name.");
      }

      await update();
      toast({
        title: "Username Update",
        description: "Username updated successfully!",
        variant: "success",
      });
      setInitialName(name);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Username Update",
        description: "Failed to update username!",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(initialName);
    setIsEditing(false);
  };

  const userEmail = session?.user?.email || "user@example.com";
  const userImage = session?.user?.image || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Profile Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userImage} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                <Image
                  src="/avatar.jpeg"
                  alt="Fallback Avatar"
                  width={200}
                  height={200}
                />
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

          {/* Details */}
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
              <p className="text-gray-600">{userEmail}</p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <p className="text-gray-600">
                {session?.user?.role || "Student"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={name.trim() === "" || isSaving}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
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
