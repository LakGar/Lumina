import { NextRequest } from "next/server";
import { GET } from "@/app/api/health/route";

describe("Health Check API", () => {
  it("should return healthy status when services are connected", async () => {
    const request = new NextRequest("http://localhost:3000/api/health");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.services).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });
});
