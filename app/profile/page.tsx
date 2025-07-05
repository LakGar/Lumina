"use client";

import { useState, useEffect } from "react";
import ProtectedLayout from "@/components/layout/protected-layout";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { useSession } from "@/hooks/useSession";
import { Loader2 } from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  membershipTier: string;
  createdAt: string;
  bio?: string;
}

export default function ProfilePage() {
  const { session, loading, error } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      try {
        setProfileLoading(true);
        setProfileError(null);

        const response = await fetch("/api/profile");
        const data = await response.json();

        if (data.success) {
          setProfileData(data.data);
        } else {
          setProfileError(data.error || "Failed to load profile");
        }
      } catch (err) {
        setProfileError("Failed to load profile");
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user]);

  // Handle profile updates
  const handleProfileSave = async (data: Partial<ProfileData>) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with new data
        setProfileData((prev) => (prev ? { ...prev, ...result.data } : null));
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error };
      }
    } catch (err) {
      return { success: false, message: "Failed to update profile" };
    }
  };

  if (loading || profileLoading) {
    return (
      <ProtectedLayout>
        <div className="h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account details
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error || profileError) {
    return (
      <ProtectedLayout>
        <div className="h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account details
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              {error || profileError || "An error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account details
          </p>
        </div>

        <ProfileEditor
          profile={profileData}
          onSave={handleProfileSave}
          loading={profileLoading}
        />
      </div>
    </ProtectedLayout>
  );
}
