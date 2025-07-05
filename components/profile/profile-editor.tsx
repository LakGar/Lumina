"use client";

import { useState, useEffect } from "react";
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
import {
  User,
  Mail,
  Calendar,
  Crown,
  Edit,
  Camera,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  membershipTier: string;
  createdAt: string;
  bio?: string;
}

interface ProfileEditorProps {
  profile: ProfileData | null;
  onSave: (
    data: Partial<ProfileData>
  ) => Promise<{ success: boolean; message?: string }>;
  loading?: boolean;
}

export function ProfileEditor({
  profile,
  onSave,
  loading = false,
}: ProfileEditorProps) {
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    fullName: "",
    email: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show preview immediately
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file to server
      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setSuccess("Avatar uploaded successfully!");
          // Clear the preview since the server now has the file
          setAvatarPreview(null);
          setAvatarFile(null);
        } else {
          setError(result.error || "Failed to upload avatar");
        }
      } catch (err) {
        setError("Failed to upload avatar");
        console.error("Error uploading avatar:", err);
      }
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSave(formData);

      if (result.success) {
        setSuccess(result.message || "Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setAvatarFile(null);
    setAvatarPreview(null);

    // Reset form data to original values
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        bio: profile.bio || "",
      });
    }
  };

  const getMembershipBadgeVariant = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "premium":
        return "default";
      case "pro":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getMembershipIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "premium":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "pro":
        return <Crown className="h-4 w-4 text-blue-500" />;
      default:
        return <Crown className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Profile Overview - Fixed */}
      <div className="w-1/3 flex-shrink-0">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative group">
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={
                    avatarPreview || profile.avatarUrl || "/default-avatar.png"
                  }
                  alt="Profile"
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-xs font-medium">
                        Change Photo
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="avatar-upload"
                      title="Click to upload new photo"
                    />
                    <div className="absolute -bottom-2 -right-2 z-20">
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </>
                )}
                {!isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium">
                {isEditing ? formData.fullName : profile.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isEditing ? formData.email : profile.email}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {getMembershipIcon(profile.membershipTier)}
                <Badge
                  variant={getMembershipBadgeVariant(profile.membershipTier)}
                >
                  {profile.membershipTier} Plan
                </Badge>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Member since{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                {success}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Details - Scrollable */}
      <div className="w-2/3 overflow-y-auto space-y-6 pr-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName || ""}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email || ""}
                  disabled={true}
                  className="mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed here. Contact support to update your
                  email address.
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                placeholder="Tell us about yourself"
                rows={3}
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {isEditing ? (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your account details and subscription information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account ID
                </label>
                <p className="text-sm font-medium">{profile.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-sm font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Current Plan
                </label>
                <div className="flex items-center gap-2">
                  {getMembershipIcon(profile.membershipTier)}
                  <span className="text-sm font-medium">
                    {profile.membershipTier} Plan
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm font-medium text-green-600">Active</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Manage your privacy preferences and data sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile information
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Sharing</p>
                <p className="text-sm text-muted-foreground">
                  Manage how your data is used for AI insights
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Control email notification preferences
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
