import { createETLWorker } from "./lib/etl-processor";

console.log("🚀 Starting ETL Worker with comprehensive logging...");
console.log("📊 Worker will process journal entries and apply AI analysis");
console.log("🔍 Monitoring for new journal entries...\n");

const worker = createETLWorker();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down ETL Worker...");
  try {
    await worker.close();
    console.log("✅ ETL Worker stopped gracefully");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error stopping worker:", error);
    process.exit(1);
  }
});

console.log("✅ ETL Worker started successfully!");
console.log("📝 Create journal entries to see AI processing in action");
console.log("🔄 Worker will automatically process new entries");
console.log("⏹️  Press Ctrl+C to stop the worker\n");
