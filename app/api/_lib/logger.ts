import { NextRequest, NextResponse } from "next/server";
import pino from "pino";
import { withCorsHeaders } from "./cors";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(process.env.LOG_FORMAT === "pretty"
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});

export type RequestLogMeta = {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
  platform?: string;
  clientVersion?: string;
  errorName?: string;
  errorMessage?: string;
};

export function logRequest(meta: RequestLogMeta): void {
  logger.info({
    ...meta,
    msg: "request",
  });
}

export type FinishMeta = {
  requestId: string;
  userId?: string;
  start: number;
  statusCode: number;
  errorName?: string;
  errorMessage?: string;
};

export function finishRequest(
  req: NextRequest,
  res: NextResponse,
  meta: FinishMeta,
): NextResponse {
  const durationMs = Date.now() - meta.start;
  const { platform, clientVersion } = getClientMeta(req);
  logRequest({
    requestId: meta.requestId,
    method: req.method,
    path: req.nextUrl.pathname,
    statusCode: meta.statusCode,
    durationMs,
    userId: meta.userId,
    platform,
    clientVersion,
    errorName: meta.errorName,
    errorMessage: meta.errorMessage,
  });
  return withCorsHeaders(res, req);
}

export function getRequestId(req: { headers?: Headers }): string {
  const id = req.headers?.get?.("x-request-id");
  return id ?? crypto.randomUUID();
}

export function getClientMeta(req: { headers?: Headers }): {
  platform?: string;
  clientVersion?: string;
} {
  const headers = req.headers;
  if (!headers?.get) return {};
  return {
    platform: headers.get("x-client-platform") ?? undefined,
    clientVersion: headers.get("x-client-version") ?? undefined,
  };
}
