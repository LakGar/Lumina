"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Download, Trash2, Edit } from "lucide-react";
import { ProfileEditor } from "./profile-editor";

interface AccountSettingsProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profile?: {
    fullName?: string | null;
    membershipTier?: string;
  };
  subscription?: {
    plan?: string;
    status?: string;
  };
}

export function AccountSettings({
  user,
  profile,
  subscription,
}: AccountSettingsProps) {
  const [exporting, setExporting] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/export?format=json");
      const data = await response.json();

      if (data.success && data.data.downloadUrl) {
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = data.data.downloadUrl;
        link.download = `lumina-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // TODO: Implement account deletion
      alert("Account deletion not yet implemented");
    }
  };

  const handleProfileUpdate = (data: {
    fullName?: string;
    avatarUrl?: string;
  }) => {
    setCurrentProfile((prev) => ({
      ...prev,
      ...data,
    }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your profile, subscription, and account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  {currentProfile?.fullName || user?.name || "No name set"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || "No email set"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileEditor(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Subscription</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      subscription?.plan === "pro" ? "default" : "secondary"
                    }
                  >
                    {subscription?.plan?.toUpperCase() || "FREE"}
                  </Badge>
                  {subscription?.status && (
                    <Badge variant="outline" className="text-xs">
                      {subscription.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription?.plan === "pro"
                    ? "Pro features enabled"
                    : "Upgrade to Pro for advanced features"}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  Download all your journal data and settings
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? "Exporting..." : "Export Data"}
              </Button>
            </div>
          </div>

          {/* Account Deletion */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <ProfileEditor
              user={user}
              profile={currentProfile}
              onClose={() => setShowProfileEditor(false)}
              onUpdate={handleProfileUpdate}
            />
          </div>
        </div>
      )}
    </>
  );
}
