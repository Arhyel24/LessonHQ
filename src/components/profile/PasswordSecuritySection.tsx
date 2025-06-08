"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PasswordSecuritySection = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (field === "new") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    // TODO: API call to update password
    console.log("Updating password");
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordStrength(0);
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return "Very Weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins">Password & Security</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => handlePasswordChange("current", e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {passwords.new && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Password Strength:</span>
                  <span className={`font-medium ${passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleUpdatePassword}
            disabled={!passwords.current || !passwords.new || !passwords.confirm}
            className="bg-primary hover:bg-primary/90"
          >
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
