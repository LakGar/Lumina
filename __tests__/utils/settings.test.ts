import {
  clearSettingsCache,
  clearAllSettingsCache,
} from "../../utils/settings";

// Mock the settings cache
const mockSettingsCache = new Map();

// Mock the module to access the cache
jest.mock("../../utils/settings", () => {
  const originalModule = jest.requireActual("../../utils/settings");
  return {
    ...originalModule,
    settingsCache: mockSettingsCache,
  };
});

describe("Settings Cache Functions", () => {
  beforeEach(() => {
    // Clear the mock cache before each test
    mockSettingsCache.clear();
  });

  describe("clearSettingsCache", () => {
    it("should clear settings for a specific user", () => {
      const userId1 = "user-1";
      const userId2 = "user-2";

      // Add some test data to cache
      mockSettingsCache.set(userId1, { aiMemoryEnabled: true });
      mockSettingsCache.set(userId2, { moodAnalysisEnabled: false });

      expect(mockSettingsCache.has(userId1)).toBe(true);
      expect(mockSettingsCache.has(userId2)).toBe(true);

      // Clear cache for user1 only
      clearSettingsCache(userId1);

      expect(mockSettingsCache.has(userId1)).toBe(false);
      expect(mockSettingsCache.has(userId2)).toBe(true);
    });

    it("should handle clearing non-existent user cache", () => {
      const userId = "non-existent-user";

      // Should not throw error
      expect(() => clearSettingsCache(userId)).not.toThrow();
    });

    it("should clear multiple user caches", () => {
      const users = ["user-1", "user-2", "user-3"];

      // Add test data
      users.forEach((userId) => {
        mockSettingsCache.set(userId, { someSetting: true });
      });

      // Clear each user's cache
      users.forEach((userId) => {
        clearSettingsCache(userId);
        expect(mockSettingsCache.has(userId)).toBe(false);
      });
    });
  });

  describe("clearAllSettingsCache", () => {
    it("should clear all settings cache", () => {
      const users = ["user-1", "user-2", "user-3"];

      // Add test data for multiple users
      users.forEach((userId) => {
        mockSettingsCache.set(userId, { someSetting: true });
      });

      expect(mockSettingsCache.size).toBe(3);

      // Clear all cache
      clearAllSettingsCache();

      expect(mockSettingsCache.size).toBe(0);
    });

    it("should handle empty cache", () => {
      expect(mockSettingsCache.size).toBe(0);

      // Should not throw error
      expect(() => clearAllSettingsCache()).not.toThrow();

      expect(mockSettingsCache.size).toBe(0);
    });

    it("should clear cache and allow new entries", () => {
      const userId = "user-1";

      // Add initial data
      mockSettingsCache.set(userId, { oldSetting: true });
      expect(mockSettingsCache.has(userId)).toBe(true);

      // Clear all cache
      clearAllSettingsCache();
      expect(mockSettingsCache.has(userId)).toBe(false);

      // Should be able to add new data
      mockSettingsCache.set(userId, { newSetting: true });
      expect(mockSettingsCache.has(userId)).toBe(true);
    });
  });
});
