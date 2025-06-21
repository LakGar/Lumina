import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

function getOpenAI() {
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return globalForOpenAI.openai;
}

// Export a getter that initializes the client only when accessed
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    const client = getOpenAI();
    return (client as any)[prop];
  },
});

export default openai;
