import { Pinecone } from "@pinecone-database/pinecone";

const globalForPinecone = globalThis as unknown as {
  pinecone: Pinecone | undefined;
};

function getPinecone() {
  if (!globalForPinecone.pinecone) {
    globalForPinecone.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return globalForPinecone.pinecone;
}

export const getPineconeIndex = () => {
  const client = getPinecone();
  return client.index(process.env.PINECONE_INDEX_NAME || "lumina-embeddings");
};

// Function to get user-specific namespace identifier
export const getUserNamespace = (userId: string): string => {
  return `user-${userId}`;
};

// Function to initialize user namespace in Pinecone
export const initializeUserNamespace = async (
  userId: string
): Promise<void> => {
  try {
    const index = getPineconeIndex();
    const namespace = getUserNamespace(userId);

    // Create a test vector to initialize the namespace
    // This ensures the namespace exists and is ready for use
    const testVector = new Array(1536).fill(0.001); // Use small non-zero values instead of zeros

    await index.namespace(namespace).upsert([
      {
        id: `${namespace}:init`,
        values: testVector,
        metadata: {
          namespace,
          userId,
          type: "namespace_init",
          timestamp: new Date().toISOString(),
        },
      },
    ]);

    console.log(`Initialized Pinecone namespace for user: ${userId}`);
  } catch (error) {
    console.error(
      `Failed to initialize Pinecone namespace for user ${userId}:`,
      error
    );
    // Don't throw error - namespace will be created automatically on first vector insert
  }
};

// Function to delete user namespace (for account deletion)
export const deleteUserNamespace = async (userId: string): Promise<void> => {
  try {
    const index = getPineconeIndex();
    const namespace = getUserNamespace(userId);

    // Delete all vectors for this user using metadata filter in the correct namespace
    await index.namespace(namespace).deleteMany({
      filter: {
        userId: { $eq: userId },
      },
    });

    console.log(`Deleted Pinecone namespace for user: ${userId}`);
  } catch (error) {
    console.error(
      `Failed to delete Pinecone namespace for user ${userId}:`,
      error
    );
    throw error;
  }
};

// Function to get user namespace information
export const getUserNamespaceInfo = (
  userId: string
): {
  namespace: string;
} => {
  return {
    namespace: getUserNamespace(userId),
  };
};

// Export a function to get the Pinecone client (lazy initialization)
export const getPineconeClient = () => getPinecone();
