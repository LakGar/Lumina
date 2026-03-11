const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/** ExponentPushToken[xxx] */
const EXPO_TOKEN_REGEX = /^ExponentPushToken\[[\w-]+\]$/;

export function isValidExpoPushToken(token: string): boolean {
  return typeof token === "string" && EXPO_TOKEN_REGEX.test(token.trim());
}

export type SendPushOptions = {
  to: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/**
 * Send push notifications via Expo Push API. Invalid tokens are filtered out.
 * Returns receipt for each token; callers can use receipts to remove invalid tokens.
 */
export async function sendExpoPush(
  options: SendPushOptions,
): Promise<{ receiptIds?: string[]; invalidTokens?: string[] }> {
  const { to, title, body, data } = options;
  const valid = to.filter((t) => isValidExpoPushToken(t));
  if (valid.length === 0) return { invalidTokens: to };

  const messages = valid.map((token) => ({
    to: token,
    title,
    body,
    sound: "default" as const,
    ...(data && Object.keys(data).length > 0 ? { data } : {}),
  }));

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Expo Push API error: ${res.status} ${text}`);
  }

  const result = (await res.json()) as {
    data?: { status: string; id?: string; message?: string }[];
  };
  const receiptIds: string[] = [];
  const invalidTokens: string[] = [];
  result.data?.forEach((item, i) => {
    if (item.id) receiptIds.push(item.id);
    if (item.status === "error" && item.message?.toLowerCase().includes("invalid")) {
      invalidTokens.push(valid[i]!);
    }
  });
  return { receiptIds, invalidTokens };
}
