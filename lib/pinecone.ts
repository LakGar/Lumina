import { Pinecone } from "@pinecone-database/pinecone";

const globalForPinecone = globalThis as unknown as {
  pinecone: Pinecone | undefined;
};

function getPinecone() {
  if (!globalForPinecone.pinecone) {
    globalForPinecone.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return globalForPinecone.pinecone;
}

// Export a getter that initializes the client only when accessed
export const pinecone = new Proxy({} as Pinecone, {
  get(target, prop) {
    const client = getPinecone();
    return (client as any)[prop];
  },
});

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
    const testVector = new Array(1532).fill(0); // Pinecone index dimension

    await index.upsert([
      {
        id: `${namespace}:init`,
        values: testVector,
        metadata: {
          userId,
          namespace,
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

    // Delete all vectors for this user using metadata filter
    await index.deleteMany({
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

export default pinecone;
