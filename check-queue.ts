import { redis } from "./lib/redis";

async function checkQueue() {
  try {
    console.log("🔍 Checking ETL queue status...");

    // Check waiting jobs
    const waitingJobs = await redis.lrange("bull:etl-pipeline:wait", 0, -1);
    console.log(`📋 Waiting jobs: ${waitingJobs.length}`);

    // Check active jobs
    const activeJobs = await redis.lrange("bull:etl-pipeline:active", 0, -1);
    console.log(`⚡ Active jobs: ${activeJobs.length}`);

    // Check completed jobs
    const completedJobs = await redis.lrange(
      "bull:etl-pipeline:completed",
      0,
      -1
    );
    console.log(`✅ Completed jobs: ${completedJobs.length}`);

    // Check failed jobs
    const failedJobs = await redis.lrange("bull:etl-pipeline:failed", 0, -1);
    console.log(`❌ Failed jobs: ${failedJobs.length}`);

    if (waitingJobs.length > 0) {
      console.log("\n📝 Waiting job details:");
      waitingJobs.forEach((job, i) => {
        try {
          const jobData = JSON.parse(job);
          console.log(
            `  ${i + 1}. Entry ID: ${jobData.data?.entryId}, User: ${
              jobData.data?.userId
            }`
          );
        } catch (e) {
          console.log(`  ${i + 1}. Raw job data: ${job.substring(0, 100)}...`);
        }
      });
    }
  } catch (error) {
    console.error("❌ Error checking queue:", error);
  } finally {
    await redis.quit();
  }
}

checkQueue();
