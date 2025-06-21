import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { checkFeatureAccess } from "@/utils/access";
import { loadUserSettings } from "@/utils/settings";
import type { MembershipTier } from "@/types";

// Validation schema for export parameters
const exportSchema = z.object({
  format: z.enum(["json", "pdf", "markdown"]).default("json"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeSummaries: z.boolean().default(true),
  includeTags: z.boolean().default(true),
  includeMood: z.boolean().default(true),
});

// Interface for export data
interface ExportEntry {
  id: string;
  content: string;
  summary?: string;
  tags?: string[];
  mood?: string;
  voiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExportData {
  metadata: {
    exportDate: string;
    totalEntries: number;
    dateRange?: {
      start: string;
      end: string;
    };
    format: string;
  };
  entries: ExportEntry[];
}

// Function to generate JSON export
function generateJSONExport(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

// Function to generate Markdown export
function generateMarkdownExport(data: ExportData): string {
  let markdown = `# Journal Export\n\n`;
  markdown += `**Export Date:** ${data.metadata.exportDate}\n`;
  markdown += `**Total Entries:** ${data.metadata.totalEntries}\n`;
  if (data.metadata.dateRange) {
    markdown += `**Date Range:** ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}\n`;
  }
  markdown += `\n---\n\n`;

  data.entries.forEach((entry, index) => {
    const date = new Date(entry.createdAt).toLocaleDateString();
    markdown += `## Entry ${index + 1} - ${date}\n\n`;

    if (entry.mood) {
      markdown += `**Mood:** ${entry.mood}\n\n`;
    }

    if (entry.tags && entry.tags.length > 0) {
      markdown += `**Tags:** ${entry.tags.join(", ")}\n\n`;
    }

    markdown += `${entry.content}\n\n`;

    if (entry.summary) {
      markdown += `**Summary:** ${entry.summary}\n\n`;
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

// Function to generate PDF export (simplified - returns HTML that can be converted)
function generatePDFExport(data: ExportData): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Journal Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .entry { margin-bottom: 40px; page-break-inside: avoid; }
    .entry-header { background: #f5f5f5; padding: 10px; margin-bottom: 15px; }
    .content { line-height: 1.6; }
    .summary { font-style: italic; color: #666; margin-top: 10px; }
    .tags { color: #007bff; }
    .mood { font-weight: bold; color: #28a745; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Journal Export</h1>
    <p><strong>Export Date:</strong> ${data.metadata.exportDate}</p>
    <p><strong>Total Entries:</strong> ${data.metadata.totalEntries}</p>
    ${
      data.metadata.dateRange
        ? `<p><strong>Date Range:</strong> ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}</p>`
        : ""
    }
  </div>
  `;

  data.entries.forEach((entry, index) => {
    const date = new Date(entry.createdAt).toLocaleDateString();
    html += `
  <div class="entry">
    <div class="entry-header">
      <h2>Entry ${index + 1} - ${date}</h2>
      ${entry.mood ? `<p class="mood">Mood: ${entry.mood}</p>` : ""}
      ${
        entry.tags && entry.tags.length > 0
          ? `<p class="tags">Tags: ${entry.tags.join(", ")}</p>`
          : ""
      }
    </div>
    <div class="content">${entry.content.replace(/\n/g, "<br>")}</div>
    ${
      entry.summary
        ? `<div class="summary"><strong>Summary:</strong> ${entry.summary}</div>`
        : ""
    }
  </div>
    `;
  });

  html += `
</body>
</html>
  `;

  return html;
}

// Function to upload export file to S3
async function uploadExportFile(
  content: string,
  format: string,
  userId: string
): Promise<string> {
  const fileName = `exports/${userId}/${uuidv4()}.${format}`;

  // In a real implementation, you would upload the file to S3
  // For now, we'll simulate the upload and return a mock URL
  console.log(`Uploading export file: ${fileName}`);

  // Simulate file upload delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return `https://s3.amazonaws.com/lumina-exports/${fileName}`;
}

// Function to generate signed download URL
async function generateDownloadURL(fileUrl: string): Promise<string> {
  // In a real implementation, you would generate a signed URL
  // For now, we'll return the file URL with a timestamp
  return `${fileUrl}?expires=${Date.now() + 300000}`; // 5 minutes
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const settings = await loadUserSettings(user.id);
    // Fetch plan from Subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    const plan = (subscription?.plan ?? "free") as MembershipTier;
    const userAccess = {
      plan,
      settings: {
        ai_memory_enabled: settings.aiMemoryEnabled,
        mood_analysis_enabled: settings.moodAnalysisEnabled,
        summary_generation_enabled: settings.summaryGenerationEnabled,
      },
    };

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      format: searchParams.get("format") || "json",
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      includeSummaries: searchParams.get("includeSummaries") !== "false",
      includeTags: searchParams.get("includeTags") !== "false",
      includeMood: searchParams.get("includeMood") !== "false",
    };

    const validatedParams = await validateRequest(exportSchema, queryParams);

    // Check membership tier restrictions
    if (validatedParams.format !== "json" && plan === "free") {
      return NextResponse.json(
        {
          success: false,
          error: "PDF and Markdown exports require Pro or Premium membership",
        },
        { status: 403 }
      );
    }

    // Enforce export format access
    if (validatedParams.format === "markdown") {
      checkFeatureAccess(userAccess, "export_markdown");
    }
    if (validatedParams.format === "pdf") {
      checkFeatureAccess(userAccess, "export_pdf");
    }

    // Build WHERE clause for date filtering
    const whereClause: {
      userId: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = { userId: user.id };
    if (validatedParams.startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        gte: new Date(validatedParams.startDate),
      };
    }
    if (validatedParams.endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(validatedParams.endDate),
      };
    }

    // Fetch journal entries
    const entries = await prisma.journalEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        summary: validatedParams.includeSummaries,
        tags: validatedParams.includeTags,
        mood: validatedParams.includeMood,
        voiceUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Prepare export data
    const exportEntries: ExportEntry[] = entries.map((entry: any) => ({
      id: entry.id,
      content: entry.content,
      summary: entry.summary || undefined,
      tags: entry.tags,
      mood: entry.mood || undefined,
      voiceUrl: entry.voiceUrl || undefined,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    const exportData: ExportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalEntries: entries.length,
        dateRange:
          validatedParams.startDate && validatedParams.endDate
            ? {
                start: validatedParams.startDate,
                end: validatedParams.endDate,
              }
            : undefined,
        format: validatedParams.format || "json",
      },
      entries: exportEntries,
    };

    // Generate export content based on format
    let exportContent: string;
    switch (validatedParams.format) {
      case "json":
        exportContent = generateJSONExport(exportData);
        break;
      case "markdown":
        exportContent = generateMarkdownExport(exportData);
        break;
      case "pdf":
        exportContent = generatePDFExport(exportData);
        break;
      default:
        exportContent = generateJSONExport(exportData);
    }

    // Upload file to S3
    const fileUrl = await uploadExportFile(
      exportContent,
      validatedParams.format || "json",
      user.id
    );

    // Generate signed download URL
    const downloadUrl = await generateDownloadURL(fileUrl);

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl,
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
        format: validatedParams.format || "json",
        totalEntries: entries.length,
        fileSize: exportContent.length,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);

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
