import { PrismaClient } from "@prisma/client";
import {
  getPineconeIndex,
  getUserNamespace,
  initializeUserNamespace,
} from "./lib/pinecone.js";

const prisma = new PrismaClient();

async function testPineconeNamespace() {
  try {
    const userId = "cmcdyqfe40004bc4tcr7tgqfg"; // Your user ID
    const namespace = getUserNamespace(userId);

    console.log("🔍 Testing Pinecone namespace for user:", userId);
    console.log("📁 Namespace:", namespace);

    // Initialize the namespace
    console.log("\n🚀 Initializing namespace...");
    await initializeUserNamespace(userId);

    // Get the index
    const index = getPineconeIndex();
    console.log(
      "📊 Index name:",
      process.env.PINECONE_INDEX_NAME || "lumina-embeddings"
    );

    // Check if we can query the namespace
    console.log("\n🔍 Querying namespace to verify it exists...");
    const queryResponse = await index.query({
      vector: new Array(1536).fill(0.1), // Test vector
      topK: 1,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
      },
    });

    console.log("✅ Namespace query successful!");
    console.log("📈 Query response:", {
      matches: queryResponse.matches?.length || 0,
      total: queryResponse.total || 0,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log(
        "🎯 Found vectors in namespace:",
        queryResponse.matches.length
      );
      queryResponse.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ID: ${match.id}, Score: ${match.score}`);
        if (match.metadata) {
          console.log(`     Metadata:`, match.metadata);
        }
      });
    } else {
      console.log("📝 No vectors found yet - namespace is ready for use");
    }

    // Check user's journal entries
    console.log("\n📖 Checking user journal entries...");
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        chunks: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`📊 Found ${entries.length} journal entries`);
    entries.forEach((entry, index) => {
      console.log(`  ${index + 1}. ID: ${entry.id}`);
      console.log(`     Content: ${entry.content.substring(0, 100)}...`);
      console.log(`     Chunks: ${entry.chunks?.length || 0}`);
      console.log(`     Created: ${entry.createdAt}`);
    });
  } catch (error) {
    console.error("❌ Error testing Pinecone namespace:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPineconeNamespace();
