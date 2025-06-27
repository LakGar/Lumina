import { ETLProcessor } from "./lib/etl-processor.ts";

console.log("🚀 Starting ETL Worker with comprehensive logging...");
console.log("📊 Worker will process journal entries and apply AI analysis");
console.log("🔍 Monitoring for new journal entries...\n");

const processor = new ETLProcessor();

// Start the worker
processor
  .startWorker()
  .then(() => {
    console.log("✅ ETL Worker started successfully!");
    console.log("📝 Create journal entries to see AI processing in action");
    console.log("🔄 Worker will automatically process new entries");
    console.log("⏹️  Press Ctrl+C to stop the worker\n");
  })
  .catch((error) => {
    console.error("❌ Failed to start ETL Worker:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down ETL Worker...");
  try {
    await processor.stopWorker();
    console.log("✅ ETL Worker stopped gracefully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error stopping worker:", error);
    process.exit(1);
  }
});
