import { PrismaClient } from "@prisma/client";
import { openai } from "./lib/openai";
import { getPineconeIndex, getUserNamespace } from "./lib/pinecone";

const prisma = new PrismaClient();

async function testChatNamespaceAccess() {
  try {
    const userId = "cmcdyqfe40004bc4tcr7tgqfg";
    const namespace = getUserNamespace(userId);

    console.log("🔍 Testing Chat Namespace Access");
    console.log("👤 User ID:", userId);
    console.log("📁 Namespace:", namespace);

    // Test 1: Generate embedding for a test query
    console.log("\n🧠 Generating embedding for test query...");
    const testQuery = "How have I been feeling about my work lately?";

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: testQuery,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log("✅ Embedding generated, dimensions:", queryEmbedding.length);

    // Test 2: Query the user's namespace
    console.log("\n🔍 Querying user namespace for relevant context...");
    const index = getPineconeIndex();

    // First, let's see what's actually in the namespace
    console.log("\n📋 Checking what vectors are in the namespace...");
    const allVectorsResponse = await index.namespace(namespace).query({
      vector: new Array(1536).fill(0.1), // Dummy vector
      topK: 10,
      includeMetadata: true,
    });

    console.log(
      `📊 Found ${
        allVectorsResponse.matches?.length || 0
      } total vectors in namespace`
    );
    if (allVectorsResponse.matches && allVectorsResponse.matches.length > 0) {
      allVectorsResponse.matches.forEach((match, index) => {
        console.log(
          `  ${index + 1}. ID: ${match.id}, Score: ${match.score?.toFixed(4)}`
        );
        console.log(`     Type: ${match.metadata?.type}`);
        console.log(`     Entry ID: ${match.metadata?.entryId || "N/A"}`);
        console.log(
          `     Text Preview: ${
            (match.metadata?.text as string)?.substring(0, 80) || "N/A"
          }...`
        );
        console.log("");
      });
    }

    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        type: { $eq: "journal_chunk" },
      },
    });

    console.log("📊 Query Results:");
    console.log(
      `  Found ${queryResponse.matches?.length || 0} relevant chunks`
    );

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      queryResponse.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. Score: ${match.score?.toFixed(4)}`);
        console.log(`     Entry ID: ${match.metadata?.entryId}`);
        console.log(`     Chunk Index: ${match.metadata?.chunkIndex}`);
        console.log(
          `     Text Preview: ${(match.metadata?.text as string)?.substring(
            0,
            100
          )}...`
        );
        console.log("");
      });
    }

    // Test 3: Fetch full journal entries for context
    console.log("\n📖 Fetching full journal entries for context...");
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const entryIds = Array.from(
        new Set(
          queryResponse.matches
            .map((match) => match.metadata?.entryId)
            .filter(Boolean) as string[]
        )
      );

      console.log(`  Unique entry IDs: ${entryIds.join(", ")}`);

      const entries = await prisma.journalEntry.findMany({
        where: {
          id: { in: entryIds },
          userId,
        },
        select: {
          id: true,
          content: true,
          summary: true,
          tags: true,
          mood: true,
          createdAt: true,
          chunks: true,
        },
        orderBy: { createdAt: "desc" },
      });

      console.log(`  Found ${entries.length} full entries`);
      entries.forEach((entry, index) => {
        console.log(`  ${index + 1}. Entry ID: ${entry.id}`);
        console.log(`     Content: ${entry.content.substring(0, 100)}...`);
        console.log(`     Summary: ${entry.summary || "None"}`);
        console.log(`     Tags: ${entry.tags.join(", ") || "None"}`);
        console.log(`     Mood: ${entry.mood || "None"}`);
        console.log(`     Chunks: ${entry.chunks?.length || 0}`);
        console.log(`     Created: ${entry.createdAt.toLocaleDateString()}`);
        console.log("");
      });
    }

    // Test 4: Test with different query types
    console.log("\n🧪 Testing different query types...");
    const testQueries = [
      "What have I written about stress?",
      "Tell me about my recent mood",
      "What projects have I been working on?",
      "How am I feeling about my personal growth?",
    ];

    for (const query of testQueries) {
      console.log(`\n  Query: "${query}"`);

      const queryEmbeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: query,
      });

      const queryVector = queryEmbeddingResponse.data[0].embedding;

      const response = await index.namespace(namespace).query({
        vector: queryVector,
        topK: 3,
        includeMetadata: true,
        filter: {
          type: { $eq: "journal_chunk" },
        },
      });

      console.log(`    Found ${response.matches?.length || 0} relevant chunks`);
      if (response.matches && response.matches.length > 0) {
        const bestMatch = response.matches[0];
        console.log(`    Best match score: ${bestMatch.score?.toFixed(4)}`);
        console.log(
          `    Best match preview: ${(
            bestMatch.metadata?.text as string
          )?.substring(0, 80)}...`
        );
      }
    }

    console.log("\n✅ Chat namespace access test completed successfully!");
  } catch (error) {
    console.error("❌ Error testing chat namespace access:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatNamespaceAccess();
