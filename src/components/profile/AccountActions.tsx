"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export const AccountActions = () => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter()

const handleDeleteAccount = async () => {
  if (confirmText !== "DELETE MY ACCOUNT") {
    toast({
      title: "Confirmation Failed",
      description: "Please type 'DELETE MY ACCOUNT' to confirm.",
      variant: "destructive",
    });
    return;
  }

  setIsDeleting(true);

  try {
    const res = await fetch("/api/user/delete-account", {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to delete account");
    }

    toast({
      title: "Account Deleted",
      description: "Your account has been successfully deleted.",
      variant: "success"
    });

    // Redirect or sign out user
    router.push("/");
    await signOut();

  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Something went wrong while deleting the account.",
      variant: "destructive",
    });
  } finally {
    setIsDeleting(false);
  }
};


  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="font-poppins text-red-600">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your account, there is no going back. This action cannot be undone.
              All your course progress, certificates, and referral data will be permanently deleted.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </p>
                  <p>
                    This includes:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>All course progress and certificates</li>
                    <li>Referral earnings and history</li>
                    <li>Personal information and settings</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="confirmDelete" className="text-sm font-medium">
                    Please type <strong>DELETE MY ACCOUNT</strong> to confirm:
                  </Label>
                  <Input
                    id="confirmDelete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="mt-2"
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "DELETE MY ACCOUNT" || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
