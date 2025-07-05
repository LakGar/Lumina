import { prisma } from "./lib/prisma";
import { etlQueue } from "./lib/queue";

async function testETLProcessing() {
  console.log("🧪 Testing ETL Processing...");

  try {
    // Get a test user
    const user = await prisma.user.findFirst({
      where: { email: { not: null } },
    });

    if (!user) {
      console.log("❌ No test user found");
      return;
    }

    console.log(`👤 Using test user: ${user.email}`);

    // Create a test journal entry
    const testEntry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content:
          "This is a test journal entry to verify ETL processing. I'm feeling excited about the new features and looking forward to seeing how the AI analysis works.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`📝 Created test entry: ${testEntry.id}`);

    // Add job to queue
    await etlQueue.add("etl-pipeline", {
      entryId: testEntry.id,
      userId: user.id,
      content: testEntry.content,
      voiceUrl: null,
    });

    console.log("✅ Added ETL job to queue");

    // Wait a bit and check the entry
    console.log("⏳ Waiting 10 seconds for processing...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const updatedEntry = await prisma.journalEntry.findUnique({
      where: { id: testEntry.id },
    });

    if (updatedEntry) {
      console.log("📊 Entry after processing:");
      console.log(`  - Tags: ${updatedEntry.tags.join(", ")}`);
      console.log(`  - Summary: ${updatedEntry.summary || "None"}`);
      console.log(`  - Mood: ${updatedEntry.mood || "None"}`);
      console.log(`  - Chunks: ${updatedEntry.chunks.length} chunks`);
    }

    // Clean up
    await prisma.journalEntry.delete({
      where: { id: testEntry.id },
    });

    console.log("🧹 Cleaned up test entry");
    console.log("✅ ETL test completed!");
  } catch (error) {
    console.error("❌ ETL test failed:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testETLProcessing();
