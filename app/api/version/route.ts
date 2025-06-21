import { NextResponse } from "next/server";

// Version information
const VERSION_INFO = {
  version: process.env.npm_package_version || "1.0.0",
  buildId: process.env.NEXT_BUILD_ID || "development",
  deployedAt: process.env.DEPLOYED_AT || new Date().toISOString(),
  environment: process.env.NODE_ENV || "development",
  gitCommit: process.env.GIT_COMMIT || "unknown",
  gitBranch: process.env.GIT_BRANCH || "unknown",
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: VERSION_INFO,
    });
  } catch (error) {
    console.error("GET /api/version error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
