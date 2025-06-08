import { ProfileOverviewCard } from "@/components/profile/ProfileOverviewCard";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { PasswordSecuritySection } from "@/components/profile/PasswordSecuritySection";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";
import { AccountActions } from "@/components/profile/AccountActions";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="font-nunito text-lg text-gray-600">
            Manage your account and personal details
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Profile Overview */}
          <ProfileOverviewCard />

          {/* Personal Information */}
          <PersonalInfoForm />

          {/* Password & Security */}
          <PasswordSecuritySection />

          {/* Notification Preferences */}
          <NotificationPreferences />

          {/* Account Actions */}
          <AccountActions />
        </div>
      </div>
    </div>
  );
};

export default Profile;
