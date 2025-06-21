// Mock Pinecone before importing
jest.mock("@/lib/pinecone", () => {
  const originalModule = jest.requireActual("@/lib/pinecone");
  return {
    ...originalModule,
    getPineconeIndex: jest.fn(() => ({
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    })),
  };
});

import {
  getUserNamespace,
  initializeUserNamespace,
  deleteUserNamespace,
  getUserNamespaceInfo,
} from "@/lib/pinecone";

describe("Pinecone Namespace Management", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserNamespace", () => {
    it("should generate correct namespace for user", () => {
      const namespace = getUserNamespace(mockUserId);
      expect(namespace).toBe("user-test-user-123");
    });

    it("should generate unique namespaces for different users", () => {
      const namespace1 = getUserNamespace("user1");
      const namespace2 = getUserNamespace("user2");
      expect(namespace1).not.toBe(namespace2);
    });
  });

  describe("initializeUserNamespace", () => {
    it("should initialize namespace successfully", async () => {
      const { getPineconeIndex } = require("@/lib/pinecone");
      const mockIndex = {
        upsert: jest.fn().mockResolvedValue(undefined),
      };
      getPineconeIndex.mockReturnValue(mockIndex);

      await initializeUserNamespace(mockUserId);

      expect(mockIndex.upsert).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "user-test-user-123:init",
          values: expect.arrayContaining([0]), // 1532 zeros
          metadata: expect.objectContaining({
            userId: mockUserId,
            namespace: "user-test-user-123",
            type: "namespace_init",
          }),
        }),
      ]);
    });

    it("should handle initialization errors gracefully", async () => {
      const { getPineconeIndex } = require("@/lib/pinecone");
      const mockIndex = {
        upsert: jest.fn().mockRejectedValue(new Error("Pinecone error")),
      };
      getPineconeIndex.mockReturnValue(mockIndex);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(initializeUserNamespace(mockUserId)).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to initialize Pinecone namespace"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("deleteUserNamespace", () => {
    it("should delete user namespace successfully", async () => {
      const { getPineconeIndex } = require("@/lib/pinecone");
      const mockIndex = {
        deleteMany: jest.fn().mockResolvedValue(undefined),
      };
      getPineconeIndex.mockReturnValue(mockIndex);

      await deleteUserNamespace(mockUserId);

      expect(mockIndex.deleteMany).toHaveBeenCalledWith({
        filter: {
          userId: { $eq: mockUserId },
        },
      });
    });

    it("should throw error on deletion failure", async () => {
      const { getPineconeIndex } = require("@/lib/pinecone");
      const mockIndex = {
        deleteMany: jest.fn().mockRejectedValue(new Error("Deletion failed")),
      };
      getPineconeIndex.mockReturnValue(mockIndex);

      await expect(deleteUserNamespace(mockUserId)).rejects.toThrow(
        "Deletion failed"
      );
    });
  });

  describe("getUserNamespaceInfo", () => {
    it("should return correct namespace info", () => {
      const info = getUserNamespaceInfo(mockUserId);
      expect(info).toEqual({
        namespace: "user-test-user-123",
      });
    });
  });
});
