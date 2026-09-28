import { Redis } from "@upstash/redis";

const REDIS_KEY = "appear:photo";

export const APPEAR_INSTRUCTION = [
  "The second image is a reference photo of one specific person.",
  "Add that exact person into the first photo, standing naturally beside the main subject, as if they were photographed together.",
].join(" ");

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getAppearPhoto(): Promise<string | null> {
  try {
    const value = await getRedis().get<string>(REDIS_KEY);
    if (typeof value === "string" && value.startsWith("data:image/")) {
      return value;
    }
    return null;
  } catch (error) {
    console.error("appear-store get error:", error);
    return null;
  }
}

export async function setAppearPhoto(dataUrl: string): Promise<void> {
  await getRedis().set(REDIS_KEY, dataUrl);
}

export async function clearAppearPhoto(): Promise<void> {
  await getRedis().del(REDIS_KEY);
}
