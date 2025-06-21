type Feature =
  | "semantic_search"
  | "ai_memory"
  | "summary_generation"
  | "mood_analysis"
  | "export_markdown"
  | "export_pdf"
  | "ai_chat";

interface AccessOptions {
  throwIfDenied?: boolean; // default true
}

interface UserAccess {
  plan: "free" | "pro" | "premium";
  settings: {
    ai_memory_enabled: boolean;
    mood_analysis_enabled: boolean;
    summary_generation_enabled: boolean;
  };
}

export function checkFeatureAccess(
  user: UserAccess,
  feature: Feature,
  options: AccessOptions = { throwIfDenied: true }
): boolean {
  const { throwIfDenied = true } = options;

  const isPro = user.plan === "pro" || user.plan === "premium";
  const isPremium = user.plan === "premium";

  let allowed = false;

  switch (feature) {
    case "semantic_search":
      allowed = isPro;
      break;
    case "ai_memory":
      allowed = isPro && user.settings.ai_memory_enabled;
      break;
    case "summary_generation":
      allowed = user.settings.summary_generation_enabled;
      break;
    case "mood_analysis":
      allowed = user.settings.mood_analysis_enabled;
      break;
    case "export_markdown":
      allowed = isPro;
      break;
    case "export_pdf":
      allowed = isPro;
      break;
    case "ai_chat":
      allowed = isPro;
      break;
    default:
      allowed = false;
  }

  if (!allowed && throwIfDenied) {
    throw new Error(
      "Access to this feature is not allowed on your current plan or settings."
    );
  }

  return allowed;
}
