/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH } from "@/app/api/users/me/preferences/route";

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

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpsert = jest.fn();

jest.mock("@/app/generated/prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    userPrefferences: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
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

describe("GET /api/users/me/preferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = createRequest(
      "http://localhost/api/users/me/preferences",
      "GET",
    );
    await GET(req);
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(401);
  });

  it("returns 200 and creates prefs on first read (upsert pattern)", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: 1,
      theme: "SYSTEM",
      goal: null,
      topics: null,
      reason: null,
      authorId: 1,
    });
    const req = createRequest(
      "http://localhost/api/users/me/preferences",
      "GET",
    );
    await GET(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { authorId: 1 } }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(200);
  });
});

describe("PATCH /api/users/me/preferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockUpsert.mockResolvedValue({
      id: 1,
      theme: "DARK",
      goal: "reflect",
      topics: null,
      reason: null,
      authorId: 1,
    });
  });

  it("returns 200 and upserts by authorId", async () => {
    const req = createRequest(
      "http://localhost/api/users/me/preferences",
      "PATCH",
      { theme: "DARK", goal: "reflect" },
    );
    await PATCH(req);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: 1 } }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(200);
  });
});
