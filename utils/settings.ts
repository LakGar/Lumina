import { prisma } from "@/lib/prisma";

// Interface for user settings
export interface UserSettings {
  id: string;
  userId: string;
  aiMemoryEnabled: boolean;
  moodAnalysisEnabled: boolean;
  summaryGenerationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cache for user settings (in production, use Redis)
const settingsCache = new Map<
  string,
  { settings: UserSettings; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load user settings with caching
 * @param userId - The user ID
 * @param forceRefresh - Force refresh the cache
 * @returns User settings
 */
export async function loadUserSettings(
  userId: string,
  forceRefresh: boolean = false
): Promise<UserSettings> {
  const now = Date.now();
  const cached = settingsCache.get(userId);

  // Return cached settings if still valid and not forcing refresh
  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL) {
    return cached.settings;
  }

  // Load settings from database
  let settings = await prisma.settings.findUnique({
    where: { userId },
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        userId,
        aiMemoryEnabled: true,
        moodAnalysisEnabled: true,
        summaryGenerationEnabled: true,
      },
    });
  }

  // Cache the settings
  settingsCache.set(userId, {
    settings,
    timestamp: now,
  });

  return settings;
}

/**
 * Update user settings and invalidate cache
 * @param userId - The user ID
 * @param updates - Settings to update
 * @returns Updated settings
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<
    Pick<
      UserSettings,
      "aiMemoryEnabled" | "moodAnalysisEnabled" | "summaryGenerationEnabled"
    >
  >
): Promise<UserSettings> {
  // Update settings in database
  const settings = await prisma.settings.upsert({
    where: { userId },
    update: updates,
    create: {
      userId,
      aiMemoryEnabled: updates.aiMemoryEnabled ?? true,
      moodAnalysisEnabled: updates.moodAnalysisEnabled ?? true,
      summaryGenerationEnabled: updates.summaryGenerationEnabled ?? true,
    },
  });

  // Invalidate cache
  settingsCache.delete(userId);

  return settings;
}

/**
 * Clear settings cache for a user
 * @param userId - The user ID
 */
export function clearSettingsCache(userId: string): void {
  settingsCache.delete(userId);
}

/**
 * Clear all settings cache
 */
export function clearAllSettingsCache(): void {
  settingsCache.clear();
}

/**
 * Check if a specific setting is enabled for a user
 * @param userId - The user ID
 * @param setting - The setting to check
 * @returns Whether the setting is enabled
 */
export async function isSettingEnabled(
  userId: string,
  setting: keyof Pick<
    UserSettings,
    "aiMemoryEnabled" | "moodAnalysisEnabled" | "summaryGenerationEnabled"
  >
): Promise<boolean> {
  const settings = await loadUserSettings(userId);
  return settings[setting];
}

/**
 * Get all settings for a user
 * @param userId - The user ID
 * @returns All user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  return loadUserSettings(userId);
}
