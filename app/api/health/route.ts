import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getPineconeIndex } from "@/lib/pinecone";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Test Redis connection
    await redis.ping();

    // Check Pinecone configuration
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

    if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
      throw new Error(
        `Pinecone configuration missing: API_KEY=${!!pineconeApiKey}, ENV=${!!pineconeEnvironment}, INDEX=${!!pineconeIndexName}`
      );
    }

    // Test Pinecone connection
    const pineconeIndex = getPineconeIndex();
    await pineconeIndex.describeIndexStats();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        redis: "connected",
        pinecone: "connected",
      },
      config: {
        pinecone: {
          environment: pineconeEnvironment,
          indexName: pineconeIndexName,
          hasApiKey: !!pineconeApiKey,
        },
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        config: {
          pinecone: {
            environment: process.env.PINECONE_ENVIRONMENT,
            indexName: process.env.PINECONE_INDEX_NAME,
            hasApiKey: !!process.env.PINECONE_API_KEY,
          },
        },
      },
      { status: 500 }
    );
  }
}
