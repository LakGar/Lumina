import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for insights parameters
const insightsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

// Interface for mood trend data
interface MoodTrend {
  mood: string;
  count: number;
  date: string;
}

// Interface for tag frequency data
interface TagFrequency {
  tag: string;
  count: number;
  percentage: number;
}

// Interface for entry frequency data
interface EntryFrequency {
  date: string;
  count: number;
}

// Interface for insights response
interface InsightsData {
  moodTrends: MoodTrend[];
  topTags: TagFrequency[];
  entryFrequency: EntryFrequency[];
  totalEntries: number;
  averageMood: string | null;
  mostActiveDay: string | null;
  writingStreak: number;
}

// Function to get mood trends
async function getMoodTrends(
  userId: string,
  startDate: Date | null,
  endDate: Date | null,
  groupBy: string
): Promise<MoodTrend[]> {
  const whereClause: any = {
    userId,
    mood: { not: null },
  };

  if (startDate) {
    whereClause.createdAt = { ...whereClause.createdAt, gte: startDate };
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
  }

  const entries = await prisma.journalEntry.findMany({
    where: whereClause,
    select: {
      mood: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date and count moods
  const moodCounts = new Map<string, Map<string, number>>();

  entries.forEach((entry: any) => {
    let dateKey: string;
    const date = new Date(entry.createdAt);

    switch (groupBy) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
      default: // day
        dateKey = date.toISOString().split("T")[0];
    }

    if (!moodCounts.has(dateKey)) {
      moodCounts.set(dateKey, new Map());
    }

    const dayMoods = moodCounts.get(dateKey)!;
    const currentCount = dayMoods.get(entry.mood!) || 0;
    dayMoods.set(entry.mood!, currentCount + 1);
  });

  // Convert to array format
  const trends: MoodTrend[] = [];
  moodCounts.forEach((dayMoods, date) => {
    dayMoods.forEach((count, mood) => {
      trends.push({ mood, count, date });
    });
  });

  return trends.sort((a, b) => a.date.localeCompare(b.date));
}

// Function to get top tags
async function getTopTags(
  userId: string,
  startDate: Date | null,
  endDate: Date | null,
  limit: number = 10
): Promise<TagFrequency[]> {
  const whereClause: any = { userId };

  if (startDate) {
    whereClause.createdAt = { ...whereClause.createdAt, gte: startDate };
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
  }

  const entries = await prisma.journalEntry.findMany({
    where: whereClause,
    select: { tags: true },
  });

  // Count tag frequencies
  const tagCounts = new Map<string, number>();
  let totalTags = 0;

  entries.forEach((entry: any) => {
    entry.tags.forEach((tag: string) => {
      const count = tagCounts.get(tag) || 0;
      tagCounts.set(tag, count + 1);
      totalTags++;
    });
  });

  // Convert to array and calculate percentages
  const tagFrequencies: TagFrequency[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return tagFrequencies;
}

// Function to get entry frequency
async function getEntryFrequency(
  userId: string,
  startDate: Date | null,
  endDate: Date | null,
  groupBy: string
): Promise<EntryFrequency[]> {
  const whereClause: any = { userId };

  if (startDate) {
    whereClause.createdAt = { ...whereClause.createdAt, gte: startDate };
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
  }

  const entries = await prisma.journalEntry.findMany({
    where: whereClause,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date and count entries
  const entryCounts = new Map<string, number>();

  entries.forEach((entry: any) => {
    let dateKey: string;
    const date = new Date(entry.createdAt);

    switch (groupBy) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
      default: // day
        dateKey = date.toISOString().split("T")[0];
    }

    const count = entryCounts.get(dateKey) || 0;
    entryCounts.set(dateKey, count + 1);
  });

  // Convert to array format
  const frequency: EntryFrequency[] = Array.from(entryCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return frequency;
}

// Function to calculate additional insights
async function getAdditionalInsights(
  userId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<{
  totalEntries: number;
  averageMood: string | null;
  mostActiveDay: string | null;
  writingStreak: number;
}> {
  const whereClause: any = { userId };

  if (startDate) {
    whereClause.createdAt = { ...whereClause.createdAt, gte: startDate };
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
  }

  const entries = await prisma.journalEntry.findMany({
    where: whereClause,
    select: {
      mood: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEntries = entries.length;

  // Calculate average mood
  const moodCounts = new Map<string, number>();
  entries.forEach((entry: any) => {
    if (entry.mood) {
      const count = moodCounts.get(entry.mood) || 0;
      moodCounts.set(entry.mood, count + 1);
    }
  });

  let averageMood: string | null = null;
  if (moodCounts.size > 0) {
    const maxCount = Math.max(...Array.from(moodCounts.values()));
    averageMood =
      Array.from(moodCounts.entries()).find(
        ([, count]) => count === maxCount
      )?.[0] || null;
  }

  // Calculate most active day of week
  const dayCounts = new Map<number, number>();
  entries.forEach((entry: any) => {
    const dayOfWeek = new Date(entry.createdAt).getDay();
    const count = dayCounts.get(dayOfWeek) || 0;
    dayCounts.set(dayOfWeek, count + 1);
  });

  let mostActiveDay: string | null = null;
  if (dayCounts.size > 0) {
    const maxDay = Math.max(...Array.from(dayCounts.values()));
    const dayNumber = Array.from(dayCounts.entries()).find(
      ([, count]) => count === maxDay
    )?.[0];
    if (dayNumber !== undefined) {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      mostActiveDay = days[dayNumber];
    }
  }

  // Calculate writing streak (simplified - consecutive days with entries)
  let writingStreak = 0;
  if (entries.length > 0) {
    const sortedDates = entries
      .map(
        (entry: any) => new Date(entry.createdAt).toISOString().split("T")[0]
      )
      .sort()
      .reverse();

    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = new Date(sortedDates[i + 1]);
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    writingStreak = currentStreak;
  }

  return {
    totalEntries,
    averageMood,
    mostActiveDay,
    writingStreak,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      groupBy: searchParams.get("groupBy") || "day",
    };

    const validatedParams = await validateRequest(insightsSchema, queryParams);

    // Parse dates
    const startDate = validatedParams.startDate
      ? new Date(validatedParams.startDate)
      : null;
    const endDate = validatedParams.endDate
      ? new Date(validatedParams.endDate)
      : null;

    // Get insights data
    const [moodTrends, topTags, entryFrequency, additionalInsights] =
      await Promise.all([
        getMoodTrends(
          user.id,
          startDate,
          endDate,
          validatedParams.groupBy || "day"
        ),
        getTopTags(user.id, startDate, endDate, 10),
        getEntryFrequency(
          user.id,
          startDate,
          endDate,
          validatedParams.groupBy || "day"
        ),
        getAdditionalInsights(user.id, startDate, endDate),
      ]);

    const insightsData: InsightsData = {
      moodTrends,
      topTags,
      entryFrequency,
      ...additionalInsights,
    };

    return NextResponse.json({
      success: true,
      data: insightsData,
    });
  } catch (error) {
    console.error("GET /api/insights error:", error);

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
