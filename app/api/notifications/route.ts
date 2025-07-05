import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for notification settings
const updateNotificationSettingsSchema = z.object({
  // Basic notification toggles
  dailyReminders: z.boolean().optional(),
  weeklyInsights: z.boolean().optional(),
  moodTrends: z.boolean().optional(),
  newFeatures: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),

  // Custom frequency settings
  dailyReminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(), // HH:MM format
  weeklyInsightDay: z
    .enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .optional(),
  weeklyInsightTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  moodTrendFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  moodTrendDay: z.string().optional(), // day of week for weekly, day of month for monthly
  moodTrendTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),

  // Advanced settings
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  timezone: z.string().optional(),
});

// Interface for notification settings response
interface NotificationSettingsResponse {
  id: string;
  userId: string;
  dailyReminders: boolean;
  weeklyInsights: boolean;
  moodTrends: boolean;
  newFeatures: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminderTime: string;
  weeklyInsightDay: string;
  weeklyInsightTime: string;
  moodTrendFrequency: string;
  moodTrendDay: string | null;
  moodTrendTime: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get or create user notification settings
    let notificationSettings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default notification settings if they don't exist
    if (!notificationSettings) {
      notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          dailyReminders: true,
          weeklyInsights: true,
          moodTrends: false,
          newFeatures: true,
          emailNotifications: true,
          pushNotifications: false,
          dailyReminderTime: "09:00",
          weeklyInsightDay: "monday",
          weeklyInsightTime: "10:00",
          moodTrendFrequency: "weekly",
          moodTrendDay: null,
          moodTrendTime: "14:00",
          quietHoursEnabled: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
          timezone: "UTC",
        },
      });
    }

    const settingsResponse: NotificationSettingsResponse = {
      id: notificationSettings.id,
      userId: notificationSettings.userId,
      dailyReminders: notificationSettings.dailyReminders,
      weeklyInsights: notificationSettings.weeklyInsights,
      moodTrends: notificationSettings.moodTrends,
      newFeatures: notificationSettings.newFeatures,
      emailNotifications: notificationSettings.emailNotifications,
      pushNotifications: notificationSettings.pushNotifications,
      dailyReminderTime: notificationSettings.dailyReminderTime,
      weeklyInsightDay: notificationSettings.weeklyInsightDay,
      weeklyInsightTime: notificationSettings.weeklyInsightTime,
      moodTrendFrequency: notificationSettings.moodTrendFrequency,
      moodTrendDay: notificationSettings.moodTrendDay,
      moodTrendTime: notificationSettings.moodTrendTime,
      quietHoursEnabled: notificationSettings.quietHoursEnabled,
      quietHoursStart: notificationSettings.quietHoursStart,
      quietHoursEnd: notificationSettings.quietHoursEnd,
      timezone: notificationSettings.timezone,
      createdAt: notificationSettings.createdAt.toISOString(),
      updatedAt: notificationSettings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: settingsResponse,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(
      updateNotificationSettingsSchema,
      body
    );

    // Get or create user notification settings
    let notificationSettings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });

    if (!notificationSettings) {
      // Create notification settings with defaults and provided values
      notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          dailyReminders: validatedData.dailyReminders ?? true,
          weeklyInsights: validatedData.weeklyInsights ?? true,
          moodTrends: validatedData.moodTrends ?? false,
          newFeatures: validatedData.newFeatures ?? true,
          emailNotifications: validatedData.emailNotifications ?? true,
          pushNotifications: validatedData.pushNotifications ?? false,
          dailyReminderTime: validatedData.dailyReminderTime ?? "09:00",
          weeklyInsightDay: validatedData.weeklyInsightDay ?? "monday",
          weeklyInsightTime: validatedData.weeklyInsightTime ?? "10:00",
          moodTrendFrequency: validatedData.moodTrendFrequency ?? "weekly",
          moodTrendDay: validatedData.moodTrendDay ?? null,
          moodTrendTime: validatedData.moodTrendTime ?? "14:00",
          quietHoursEnabled: validatedData.quietHoursEnabled ?? false,
          quietHoursStart: validatedData.quietHoursStart ?? "22:00",
          quietHoursEnd: validatedData.quietHoursEnd ?? "08:00",
          timezone: validatedData.timezone ?? "UTC",
        },
      });
    } else {
      // Update existing notification settings
      const updateData: any = {};

      // Only update fields that were provided
      Object.keys(validatedData).forEach((key) => {
        if (validatedData[key as keyof typeof validatedData] !== undefined) {
          updateData[key] = validatedData[key as keyof typeof validatedData];
        }
      });

      notificationSettings = await prisma.notificationSettings.update({
        where: { userId: user.id },
        data: updateData,
      });
    }

    const settingsResponse: NotificationSettingsResponse = {
      id: notificationSettings.id,
      userId: notificationSettings.userId,
      dailyReminders: notificationSettings.dailyReminders,
      weeklyInsights: notificationSettings.weeklyInsights,
      moodTrends: notificationSettings.moodTrends,
      newFeatures: notificationSettings.newFeatures,
      emailNotifications: notificationSettings.emailNotifications,
      pushNotifications: notificationSettings.pushNotifications,
      dailyReminderTime: notificationSettings.dailyReminderTime,
      weeklyInsightDay: notificationSettings.weeklyInsightDay,
      weeklyInsightTime: notificationSettings.weeklyInsightTime,
      moodTrendFrequency: notificationSettings.moodTrendFrequency,
      moodTrendDay: notificationSettings.moodTrendDay,
      moodTrendTime: notificationSettings.moodTrendTime,
      quietHoursEnabled: notificationSettings.quietHoursEnabled,
      quietHoursStart: notificationSettings.quietHoursStart,
      quietHoursEnd: notificationSettings.quietHoursEnd,
      timezone: notificationSettings.timezone,
      createdAt: notificationSettings.createdAt.toISOString(),
      updatedAt: notificationSettings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: settingsResponse,
      message: "Notification settings updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);

    if (error instanceof Error && error.message.includes("Validation error")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
