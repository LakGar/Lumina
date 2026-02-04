/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "@/app/api/journals/route";
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/journals/[id]/route";

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

const mockJournalFindMany = jest.fn();
const mockJournalFindFirst = jest.fn();
const mockJournalCreate = jest.fn();
const mockJournalUpdate = jest.fn();
const mockJournalDelete = jest.fn();

jest.mock("@/app/generated/prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    journal: {
      findMany: (...args: unknown[]) => mockJournalFindMany(...args),
      findFirst: (...args: unknown[]) => mockJournalFindFirst(...args),
      create: (...args: unknown[]) => mockJournalCreate(...args),
      update: (...args: unknown[]) => mockJournalUpdate(...args),
      delete: (...args: unknown[]) => mockJournalDelete(...args),
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

describe("GET /api/journals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockJournalFindMany.mockResolvedValue([]);
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = createRequest("http://localhost/api/journals", "GET");
    const res = await GET(req);
    expect(mockFinishRequest).toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(401);
  });

  it("returns 200 and list when authenticated", async () => {
    const list = [
      {
        id: 1,
        title: "J1",
        public: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { entries: 0 },
      },
    ];
    mockJournalFindMany.mockResolvedValue(list);
    const req = createRequest("http://localhost/api/journals", "GET");
    const res = await GET(req);
    expect(mockJournalFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: 1 } }),
    );
    expect(mockFinishRequest).toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(200);
  });
});

describe("POST /api/journals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockJournalCreate.mockResolvedValue({
      id: 1,
      title: "New",
      public: false,
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = createRequest("http://localhost/api/journals", "POST", {
      title: "J",
    });
    await POST(req);
    expect(mockJournalCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when title is missing", async () => {
    const req = createRequest("http://localhost/api/journals", "POST", {});
    await POST(req);
    expect(mockJournalCreate).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(400);
  });

  it("returns 201 and creates journal when title provided", async () => {
    const req = createRequest("http://localhost/api/journals", "POST", {
      title: "My Journal",
    });
    await POST(req);
    expect(mockJournalCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "My Journal", authorId: 1 }),
      }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(201);
  });
});

describe("GET /api/journals/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when journal not found or not owned", async () => {
    mockJournalFindFirst.mockResolvedValue(null);
    const req = createRequest("http://localhost/api/journals/99", "GET");
    await GET_ONE(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockJournalFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 99, authorId: 1 } }),
    );
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(404);
  });

  it("ownership regression: returns 404 when journal belongs to another user", async () => {
    mockJournalFindFirst.mockResolvedValue(null);
    const req = createRequest("http://localhost/api/journals/2", "GET");
    await GET_ONE(req, { params: Promise.resolve({ id: "2" }) });
    expect((mockFinishRequest.mock.calls[0][1] as NextResponse).status).toBe(
      404,
    );
  });

  it("returns 200 when journal owned by user", async () => {
    const journal = {
      id: 1,
      title: "J",
      public: false,
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockJournalFindFirst.mockResolvedValue(journal);
    const req = createRequest("http://localhost/api/journals/1", "GET");
    await GET_ONE(req, { params: Promise.resolve({ id: "1" }) });
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(200);
  });
});

describe("PATCH /api/journals/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when journal not found", async () => {
    mockJournalFindFirst.mockResolvedValue(null);
    const req = createRequest("http://localhost/api/journals/99", "PATCH", {
      title: "Updated",
    });
    await PATCH(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockJournalUpdate).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(404);
  });
});

describe("DELETE /api/journals/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
  });

  it("returns 404 when journal not found", async () => {
    mockJournalFindFirst.mockResolvedValue(null);
    const req = createRequest("http://localhost/api/journals/99", "DELETE");
    await DELETE(req, { params: Promise.resolve({ id: "99" }) });
    expect(mockJournalDelete).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as Response).status).toBe(404);
  });
});
