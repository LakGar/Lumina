/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import {
  GET as GET_LIST,
  POST as POST_ENTRY,
} from "@/app/api/journals/[id]/entries/route";
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/entries/[id]/route";

const mockRequireAuth = jest.fn();
const mockFinishRequest = jest.fn((_req: unknown, res: unknown) => res);
const mockGetRequestId = jest.fn(() => "test-request-id");

jest.mock("@/app/api/_lib/auth", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));
jest.mock("@/app/api/_lib/logger", () => ({
  getRequestId: (...args: unknown[]) => mockGetRequestId(...args),
  finishRequest: (...args: unknown[]) => mockFinishRequest(...args),
}));

const mockJournalFindFirst = jest.fn();
const mockEntryFindMany = jest.fn();
const mockEntryFindFirst = jest.fn();
const mockEntryCreate = jest.fn();
const mockEntryUpdate = jest.fn();
const mockEntryDelete = jest.fn();
const mockEntryCount = jest.fn();
const mockEntryFindUnique = jest.fn();
const mockEntryMoodUpsert = jest.fn();
const mockEntryTagUpsert = jest.fn();
const mockEntryTagDeleteMany = jest.fn();

jest.mock("@/app/generated/prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    journal: {
      findFirst: (...args: unknown[]) => mockJournalFindFirst(...args),
    },
    journalEntry: {
      findMany: (...args: unknown[]) => mockEntryFindMany(...args),
      findFirst: (...args: unknown[]) => mockEntryFindFirst(...args),
      findUnique: (...args: unknown[]) => mockEntryFindUnique(...args),
      create: (...args: unknown[]) => mockEntryCreate(...args),
      update: (...args: unknown[]) => mockEntryUpdate(...args),
      delete: (...args: unknown[]) => mockEntryDelete(...args),
      count: (...args: unknown[]) => mockEntryCount(...args),
    },
    entryMood: {
      upsert: (...args: unknown[]) => mockEntryMoodUpsert(...args),
    },
    entryTag: {
      upsert: (...args: unknown[]) => mockEntryTagUpsert(...args),
      deleteMany: (...args: unknown[]) => mockEntryTagDeleteMany(...args),
    },
  })),
}));

const authUser = {
  ok: true as const,
  userId: "clerk-1",
  user: { id: 1, clerkId: "clerk-1", email: "u@test.com", name: "User" },
};

function createRequest(
  url: string,
  method: string,
  body?: object,
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }) as NextRequest;
}

describe("GET /api/journals/[id]/entries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = createRequest("http://localhost/api/journals/1/entries", "GET");
    await GET_LIST(req, { params: Promise.resolve({ id: "1" }) });
    expect(mockJournalFindFirst).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(401);
  });

  it("returns 404 when journal not found or not owned (ownership)", async () => {
    mockJournalFindFirst.mockResolvedValue(null);
    const req = createRequest(
      "http://localhost/api/journals/99/entries",
      "GET",
    );
    await GET_LIST(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockJournalFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 99, authorId: 1 } }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(404);
  });

  it("returns 200 and list when journal owned", async () => {
    mockJournalFindFirst.mockResolvedValue({ id: 1, authorId: 1 });
    mockEntryFindMany.mockResolvedValue([]);
    mockEntryCount.mockResolvedValue(0);
    const req = createRequest("http://localhost/api/journals/1/entries", "GET");
    await GET_LIST(req, { params: Promise.resolve({ id: "1" }) });
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(200);
  });
});

describe("POST /api/journals/[id]/entries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when journal not owned", async () => {
    mockJournalFindFirst.mockResolvedValue(null);
    const req = createRequest(
      "http://localhost/api/journals/99/entries",
      "POST",
      { content: "Hello" },
    );
    await POST_ENTRY(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockEntryCreate).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(404);
  });

  it("returns 201 when entry created (with optional mood/tags)", async () => {
    mockJournalFindFirst.mockResolvedValue({ id: 1, authorId: 1 });
    const created = { id: 1, journalId: 1, content: "Hi", source: "TEXT" };
    mockEntryCreate.mockResolvedValue(created);
    mockEntryFindUnique.mockResolvedValue(created);
    const req = createRequest(
      "http://localhost/api/journals/1/entries",
      "POST",
      { content: "Hi" },
    );
    await POST_ENTRY(req, { params: Promise.resolve({ id: "1" }) });
    expect((mockFinishRequest.mock.calls[0][1] as NextResponse).status).toBe(
      201,
    );
  });
});

describe("GET /api/entries/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when entry not found or not owned (ownership)", async () => {
    mockEntryFindFirst.mockResolvedValue(null);
    const req = createRequest("http://localhost/api/entries/99", "GET");
    await GET_ONE(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockEntryFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 99, journal: { authorId: 1 } },
      }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(404);
  });
});
