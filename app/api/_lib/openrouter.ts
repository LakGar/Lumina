/**
 * OpenRouter API client for Lumina.
 * Two keys: entries (entry AI, go deeper) and chat (journal chat, weekly tips).
 * Set OPENROUTER_ENTRIES_API_KEY and OPENROUTER_CHAT_API_KEY in .env.
 */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function openrouterChat(params: {
  apiKey: "entries" | "chat";
  messages: OpenRouterMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}> {
  const key =
    params.apiKey === "entries"
      ? process.env.OPENROUTER_ENTRIES_API_KEY
      : process.env.OPENROUTER_CHAT_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      params.apiKey === "entries"
        ? "OPENROUTER_ENTRIES_API_KEY is not set"
        : "OPENROUTER_CHAT_API_KEY is not set",
    );
  }
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.APP_URL?.split(",")[0] ?? "https://lumina.com",
    },
    body: JSON.stringify({
      model: params.model ?? DEFAULT_MODEL,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 1024,
      temperature: params.temperature ?? 0.7,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `OpenRouter ${params.apiKey} error ${res.status}: ${text.slice(0, 500)}`,
    );
  }
  const data = (await res.json()) as {
    choices?: Array<{
      message?: { content?: string };
      delta?: { content?: string };
    }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };
  const content =
    data.choices?.[0]?.message?.content ??
    data.choices?.[0]?.delta?.content ??
    "";
  return { content: content.trim(), usage: data.usage };
}

/** Call OpenRouter with the entries key (entry AI, go deeper). */
export function entriesCompletion(
  messages: OpenRouterMessage[],
  opts?: { model?: string; maxTokens?: number; temperature?: number },
) {
  return openrouterChat({ apiKey: "entries", messages, ...opts });
}

/** Call OpenRouter with the chat key (journal chat, weekly tips). */
export function chatCompletion(
  messages: OpenRouterMessage[],
  opts?: { model?: string; maxTokens?: number; temperature?: number },
) {
  return openrouterChat({ apiKey: "chat", messages, ...opts });
}
