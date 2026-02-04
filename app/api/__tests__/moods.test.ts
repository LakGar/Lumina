/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "@/app/api/moods/route";
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/moods/[id]/route";

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

const mockMoodFindMany = jest.fn();
const mockMoodFindFirst = jest.fn();
const mockMoodCreate = jest.fn();
const mockMoodUpdate = jest.fn();
const mockMoodDelete = jest.fn();

jest.mock("@/app/generated/prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    mood: {
      findMany: (...args: unknown[]) => mockMoodFindMany(...args),
      findFirst: (...args: unknown[]) => mockMoodFindFirst(...args),
      create: (...args: unknown[]) => mockMoodCreate(...args),
      update: (...args: unknown[]) => mockMoodUpdate(...args),
      delete: (...args: unknown[]) => mockMoodDelete(...args),
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

describe("GET /api/moods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockMoodFindMany.mockResolvedValue([]);
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = createRequest("http://localhost/api/moods", "GET");
    await GET(req);
    expect(mockMoodFindMany).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(401);
  });

  it("returns 200 and list when authenticated", async () => {
    mockMoodFindMany.mockResolvedValue([
      { id: 1, title: "Calm", note: null, authorId: 1 },
    ]);
    const req = createRequest("http://localhost/api/moods", "GET");
    await GET(req);
    expect(mockMoodFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: 1 } }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(200);
  });
});

describe("POST /api/moods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockMoodCreate.mockResolvedValue({
      id: 1,
      title: "Grateful",
      note: null,
      authorId: 1,
    });
  });

  it("returns 400 when title is missing", async () => {
    const req = createRequest("http://localhost/api/moods", "POST", {});
    await POST(req);
    expect(mockMoodCreate).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(400);
  });

  it("returns 201 when title provided", async () => {
    const req = createRequest("http://localhost/api/moods", "POST", {
      title: "Calm",
    });
    await POST(req);
    expect(mockMoodCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "Calm", authorId: 1 }),
      }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(201);
  });
});

describe("GET /api/moods/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when mood not found", async () => {
    mockMoodFindFirst.mockResolvedValue(null);
    await GET_ONE(createRequest("http://localhost/api/moods/99", "GET"), {
      params: Promise.resolve({ id: "99" }),
    });
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(404);
  });

  it("ownership regression: returns 404 when mood belongs to another user", async () => {
    mockMoodFindFirst.mockResolvedValue(null);
    await GET_ONE(createRequest("http://localhost/api/moods/2", "GET"), {
      params: Promise.resolve({ id: "2" }),
    });
    expect((mockFinishRequest.mock.calls[0][1] as NextResponse).status).toBe(
      404,
    );
  });
});
