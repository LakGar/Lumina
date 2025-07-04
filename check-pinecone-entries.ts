import { PrismaClient } from "@prisma/client";
import { getPineconeIndex, getUserNamespace } from "./lib/pinecone";

const prisma = new PrismaClient();

async function checkPineconeEntries() {
  try {
    console.log("🔍 Checking Pinecone entries and journal data...");

    // Check all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        journalEntries: {
          select: {
            id: true,
            content: true,
            chunks: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    console.log(`📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (${user.id})`);
      console.log(`📝 Journal entries: ${user.journalEntries.length}`);

      if (user.journalEntries.length > 0) {
        const latestEntry = user.journalEntries[0];
        console.log(`   Latest entry: ${latestEntry.id}`);
        console.log(`   Content: ${latestEntry.content.substring(0, 100)}...`);
        console.log(`   Chunks: ${latestEntry.chunks?.length || 0}`);
        console.log(`   Created: ${latestEntry.createdAt}`);

        // Check Pinecone for this user
        const namespace = getUserNamespace(user.id);
        console.log(`   📁 Namespace: ${namespace}`);

        try {
          const index = getPineconeIndex();
          const queryResponse = await index.namespace(namespace).query({
            vector: new Array(1536).fill(0.1),
            topK: 5,
            includeMetadata: true,
          });

          console.log(
            `   🎯 Pinecone vectors: ${queryResponse.matches?.length || 0}`
          );

          if (queryResponse.matches && queryResponse.matches.length > 0) {
            queryResponse.matches.forEach((match, i) => {
              console.log(
                `     ${i + 1}. ID: ${match.id}, Score: ${match.score}`
              );
              if (match.metadata) {
                console.log(
                  `        Metadata: ${JSON.stringify(match.metadata)}`
                );
              }
            });
          }
        } catch (error) {
          console.log(
            `   ❌ Pinecone error: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }

    // Check ETL queue status
    console.log("\n🔧 Checking ETL queue...");
    try {
      const { redis } = await import("./lib/redis");
      const queueInfo = await redis.lrange("bull:etl-pipeline:wait", 0, -1);
      console.log(`   Queue length: ${queueInfo.length}`);

      if (queueInfo.length > 0) {
        console.log("   Jobs in queue:");
        queueInfo.forEach((job, i) => {
          console.log(`     ${i + 1}. ${job.substring(0, 100)}...`);
        });
      }
    } catch (error) {
      console.log(
        `   ❌ Redis error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } catch (error) {
    console.error("❌ Error checking entries:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPineconeEntries();
