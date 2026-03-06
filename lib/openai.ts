import "server-only";
import OpenAI from "openai";
import { env } from "@/lib/env";

let cachedClient: OpenAI | null = null;

export class MissingOpenAIKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is missing. Set it in your environment before generating plans.");
    this.name = "MissingOpenAIKeyError";
  }
}

export function getOpenAIClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new MissingOpenAIKeyError();
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });
  }

  return cachedClient;
}

export const DEFAULT_OPENAI_MODEL = env.OPENAI_MODEL;
