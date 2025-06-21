import { checkFeatureAccess } from "../../utils/access";

describe("checkFeatureAccess", () => {
  const mockUser = {
    plan: "free" as const,
    settings: {
      ai_memory_enabled: true,
      mood_analysis_enabled: true,
      summary_generation_enabled: true,
    },
  };

  describe("semantic search feature", () => {
    it("should deny free users semantic search", () => {
      const result = checkFeatureAccess(mockUser, "semantic_search", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });

    it("should allow pro users semantic search", () => {
      const proUser = { ...mockUser, plan: "pro" as const };
      const result = checkFeatureAccess(proUser, "semantic_search", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });

    it("should allow premium users semantic search", () => {
      const premiumUser = { ...mockUser, plan: "premium" as const };
      const result = checkFeatureAccess(premiumUser, "semantic_search", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });
  });

  describe("export feature", () => {
    it("should deny free users export_markdown", () => {
      const result = checkFeatureAccess(mockUser, "export_markdown", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });

    it("should deny free users export_pdf", () => {
      const result = checkFeatureAccess(mockUser, "export_pdf", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });

    it("should allow pro users export_markdown", () => {
      const proUser = { ...mockUser, plan: "pro" as const };
      const result = checkFeatureAccess(proUser, "export_markdown", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });

    it("should allow pro users export_pdf", () => {
      const proUser = { ...mockUser, plan: "pro" as const };
      const result = checkFeatureAccess(proUser, "export_pdf", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });
  });

  describe("ai chat feature", () => {
    it("should deny free users ai chat", () => {
      const result = checkFeatureAccess(mockUser, "ai_chat", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });

    it("should allow pro users ai chat", () => {
      const proUser = { ...mockUser, plan: "pro" as const };
      const result = checkFeatureAccess(proUser, "ai_chat", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });

    it("should allow premium users ai chat", () => {
      const premiumUser = { ...mockUser, plan: "premium" as const };
      const result = checkFeatureAccess(premiumUser, "ai_chat", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });
  });

  describe("mood analysis feature", () => {
    it("should allow mood analysis when enabled", () => {
      const result = checkFeatureAccess(mockUser, "mood_analysis", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });

    it("should deny mood analysis when disabled", () => {
      const userWithDisabledMood = {
        ...mockUser,
        settings: { ...mockUser.settings, mood_analysis_enabled: false },
      };
      const result = checkFeatureAccess(userWithDisabledMood, "mood_analysis", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });
  });

  describe("summary generation feature", () => {
    it("should allow summary generation when enabled", () => {
      const result = checkFeatureAccess(mockUser, "summary_generation", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });

    it("should deny summary generation when disabled", () => {
      const userWithDisabledSummary = {
        ...mockUser,
        settings: { ...mockUser.settings, summary_generation_enabled: false },
      };
      const result = checkFeatureAccess(
        userWithDisabledSummary,
        "summary_generation",
        { throwIfDenied: false }
      );
      expect(result).toBe(false);
    });
  });

  describe("ai memory feature", () => {
    it("should deny free users ai memory", () => {
      const result = checkFeatureAccess(mockUser, "ai_memory", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });

    it("should allow pro users ai memory when enabled", () => {
      const proUser = { ...mockUser, plan: "pro" as const };
      const result = checkFeatureAccess(proUser, "ai_memory", {
        throwIfDenied: false,
      });
      expect(result).toBe(true);
    });

    it("should deny pro users ai memory when disabled", () => {
      const proUser = {
        ...mockUser,
        plan: "pro" as const,
        settings: { ...mockUser.settings, ai_memory_enabled: false },
      };
      const result = checkFeatureAccess(proUser, "ai_memory", {
        throwIfDenied: false,
      });
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw error when access denied and throwIfDenied is true", () => {
      expect(() => {
        checkFeatureAccess(mockUser, "semantic_search");
      }).toThrow(
        "Access to this feature is not allowed on your current plan or settings."
      );
    });

    it("should not throw error when access denied and throwIfDenied is false", () => {
      expect(() => {
        checkFeatureAccess(mockUser, "semantic_search", {
          throwIfDenied: false,
        });
      }).not.toThrow();
    });
  });
});
