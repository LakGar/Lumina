import { createETLWorker } from "./lib/etl-processor";
import { etlQueue } from "./lib/queue";
import { prisma } from "./lib/prisma";

async function ensureETLWorker() {
  console.log("🚀 Ensuring ETL Worker is running...");

  try {
    // Create and start the ETL worker
    const worker = createETLWorker();
    console.log("✅ ETL Worker started successfully!");

    // Check for any unprocessed entries (entries without chunks)
    console.log("🔍 Checking for unprocessed entries...");
    const unprocessedEntries = await prisma.journalEntry.findMany({
      where: {
        chunks: {
          equals: [],
        },
      },
      select: {
        id: true,
        userId: true,
        content: true,
        voiceUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (unprocessedEntries.length > 0) {
      console.log(
        `📝 Found ${unprocessedEntries.length} unprocessed entries. Reprocessing...`
      );

      for (const entry of unprocessedEntries) {
        console.log(`🔄 Reprocessing entry: ${entry.id}`);
        try {
          await etlQueue.add("etl-pipeline", {
            entryId: entry.id,
            userId: entry.userId,
            content: entry.content,
            voiceUrl: entry.voiceUrl,
          });
          console.log(`✅ Entry ${entry.id} queued for reprocessing`);
        } catch (error) {
          console.error(`❌ Failed to queue entry ${entry.id}:`, error);
        }
      }
    } else {
      console.log("✅ All entries are processed!");
    }

    // Set up graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down ETL Worker gracefully...");
      await worker.close();
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("\n🛑 Shutting down ETL Worker gracefully...");
      await worker.close();
      await prisma.$disconnect();
      process.exit(0);
    });

    console.log("🔄 ETL Worker is running and monitoring for new entries...");
    console.log("⏹️  Press Ctrl+C to stop the worker");
  } catch (error) {
    console.error("❌ Failed to start ETL Worker:", error);
    process.exit(1);
  }
}

ensureETLWorker();
