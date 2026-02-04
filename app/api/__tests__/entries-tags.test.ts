/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/entries/[id]/tags/route";
import { DELETE } from "@/app/api/entries/[id]/tags/[tag]/route";

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

const mockEntryFindFirst = jest.fn();
const mockEntryTagUpsert = jest.fn();
const mockEntryTagDeleteMany = jest.fn();

jest.mock("@/app/generated/prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    journalEntry: {
      findFirst: (...args: unknown[]) => mockEntryFindFirst(...args),
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

describe("POST /api/entries/[id]/tags", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when entry not owned (ownership)", async () => {
    mockEntryFindFirst.mockResolvedValue(null);
    const req = createRequest("http://localhost/api/entries/99/tags", "POST", {
      tag: "work",
    });
    await POST(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockEntryTagUpsert).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(404);
  });

  it("returns 400 when tag is missing", async () => {
    mockEntryFindFirst.mockResolvedValue({ id: 1 });
    const req = createRequest(
      "http://localhost/api/entries/1/tags",
      "POST",
      {},
    );
    await POST(req, { params: Promise.resolve({ id: "1" }) });
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(400);
  });
});

describe("DELETE /api/entries/[id]/tags/[tag]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when entry not owned (ownership)", async () => {
    mockEntryFindFirst.mockResolvedValue(null);
    const req = createRequest(
      "http://localhost/api/entries/99/tags/work",
      "DELETE",
    );
    await DELETE(req, { params: Promise.resolve({ id: "99", tag: "work" }) });
    expect(mockEntryTagDeleteMany).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(404);
  });
});
