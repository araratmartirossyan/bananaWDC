import { Redis } from "@upstash/redis";
import { filterConfigs } from "@/app/api/process-image/filters";

const REDIS_KEY = "filters:config";

export interface StoredFilter {
  id: string;
  name: string;
  description: string;
  prompt: string;
  visible: boolean;
}

function idToLabel(id: string): string {
  if (id === "none") return "Original";
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildSeedFilters(): StoredFilter[] {
  const noneEntry: StoredFilter = {
    id: "none",
    name: "Original",
    description: "No filter",
    prompt: "",
    visible: true,
  };
  const fromConfigs: StoredFilter[] = Object.entries(filterConfigs).map(
    ([id, config]) => ({
      id,
      name: idToLabel(id),
      description: idToLabel(id),
      prompt: config.prompt.trim(),
      visible: true,
    })
  );
  return [noneEntry, ...fromConfigs];
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getFilters(): Promise<StoredFilter[]> {
  const redis = getRedis();
  try {
    const raw = await redis.get<string>(REDIS_KEY);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      return raw as StoredFilter[];
    }
  } catch (e) {
    console.error("filters-store getFilters error:", e);
  }
  const seed = buildSeedFilters();
  try {
    await redis.set(REDIS_KEY, JSON.stringify(seed));
  } catch (e) {
    console.error("filters-store seed write error:", e);
  }
  return seed;
}

export async function getVisibleFilters(): Promise<
  { id: string; name: string; description: string }[]
> {
  const all = await getFilters();
  return all
    .filter((f) => f.visible)
    .map(({ id, name, description }) => ({ id, name, description }));
}

export async function getFilterPrompt(id: string): Promise<string | null> {
  const all = await getFilters();
  const found = all.find((f) => f.id === id);
  if (!found) return null;
  return found.prompt || null;
}

export async function setFilters(filters: StoredFilter[]): Promise<void> {
  const redis = getRedis();
  await redis.set(REDIS_KEY, JSON.stringify(filters));
}
