"use client";

import ProtectedLayout from "@/components/layout/protected-layout";
import { AIFeaturesSettings } from "@/components/settings/ai-features-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";
import { EnhancedNotificationSettings } from "@/components/settings/enhanced-notification-settings";
import { useSession } from "@/hooks/useSession";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Palette, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { session, loading, error } = useSession();

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-red-600">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Settings */}
          <AccountSettings
            user={session?.user}
            profile={session?.profile}
            subscription={session?.subscription}
          />

          {/* AI Features Settings */}
          <AIFeaturesSettings />

          {/* Notifications Settings */}
          <EnhancedNotificationSettings />

          {/* Privacy & Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Processing</p>
                  <p className="text-sm text-muted-foreground">
                    Control how your data is processed by AI
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">
                    Manage active sessions and devices
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Manage Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <ThemeSwitcher />
        </div>
      </div>
    </ProtectedLayout>
  );
}
