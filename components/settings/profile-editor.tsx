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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Save, X } from "lucide-react";

interface ProfileEditorProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profile?: {
    fullName?: string | null;
    avatarUrl?: string | null;
    membershipTier?: string;
  };
  onClose: () => void;
  onUpdate: (data: { fullName?: string; avatarUrl?: string }) => void;
}

export function ProfileEditor({
  user,
  profile,
  onClose,
  onUpdate,
}: ProfileEditorProps) {
  const [fullName, setFullName] = useState(
    profile?.fullName || user?.name || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatarUrl || user?.image || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onUpdate({
          fullName: fullName.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        });
        onClose();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
      console.error("Profile update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll use a placeholder URL
    // In a real implementation, you'd upload to S3 and get the URL
    setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your profile information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl || "/default-avatar.png"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2 border-gray-200 cursor-pointer hover:bg-gray-50">
                <Camera className="h-4 w-4 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Click the camera icon to upload a new profile picture
              </p>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        {/* Email Section (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="flex items-center gap-2">
            <Input value={user?.email || ""} disabled />
            <Badge variant="secondary">Connected via Google</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Email is managed through your Google account
          </p>
        </div>

        {/* Membership Tier */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Membership</label>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                profile?.membershipTier === "pro" ? "default" : "secondary"
              }
            >
              {profile?.membershipTier?.toUpperCase() || "FREE"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {profile?.membershipTier === "pro"
                ? "Pro features enabled"
                : "Upgrade to Pro for advanced features"}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isUpdating} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
