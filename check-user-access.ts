import { PrismaClient } from "@prisma/client";
import { checkFeatureAccess } from "./utils/access";

const prisma = new PrismaClient();

async function checkUserAccess() {
  try {
    const userId = "cmcdyqfe40004bc4tcr7tgqfg";

    console.log("🔍 Checking user access and settings...");

    // Get user subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    console.log("📊 Subscription:", {
      plan: subscription?.plan,
      status: subscription?.status,
      currentPeriodEnd: subscription?.currentPeriodEnd,
    });

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    console.log("⚙️ Settings:", {
      aiMemoryEnabled: settings?.aiMemoryEnabled,
      moodAnalysisEnabled: settings?.moodAnalysisEnabled,
      summaryGenerationEnabled: settings?.summaryGenerationEnabled,
    });

    // Check feature access
    const user = {
      plan: (subscription?.plan || "free") as "free" | "pro" | "premium",
      settings: {
        ai_memory_enabled: settings?.aiMemoryEnabled || false,
        mood_analysis_enabled: settings?.moodAnalysisEnabled || false,
        summary_generation_enabled: settings?.summaryGenerationEnabled || false,
      },
    };

    console.log("👤 User object for feature access:", user);

    console.log("\n🔐 Feature Access Results:");
    console.log(
      "AI Memory:",
      checkFeatureAccess(user, "ai_memory", { throwIfDenied: false })
    );
    console.log(
      "Mood Analysis:",
      checkFeatureAccess(user, "mood_analysis", { throwIfDenied: false })
    );
    console.log(
      "Summary Generation:",
      checkFeatureAccess(user, "summary_generation", { throwIfDenied: false })
    );
    console.log(
      "AI Chat:",
      checkFeatureAccess(user, "ai_chat", { throwIfDenied: false })
    );
  } catch (error) {
    console.error("❌ Error checking user access:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAccess();
