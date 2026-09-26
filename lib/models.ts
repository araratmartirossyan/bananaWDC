/**
 * Fal image-edit catalog. To add another model, append an object with:
 * - id: stable client/API value
 * - label: chip text in the camera UI
 * - endpoint: full Fal model id (not always `fal-ai/.../edit`)
 * - extraInput: optional extra subscribe() fields for that endpoint
 */
export const IMAGE_EDIT_MODELS = [
  {
    id: "nano-banana",
    label: "Nano Banana",
    endpoint: "fal-ai/nano-banana/edit",
    waitHint: "Image generate can take up to 5–10 seconds",
  },
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    endpoint: "fal-ai/nano-banana-2/edit",
    waitHint: "Image generate can take up to 5–10 seconds",
  },
  {
    id: "nano-banana-pro",
    label: "Nano Banana Pro",
    endpoint: "fal-ai/nano-banana-pro/edit",
    waitHint: "Image generate can take up to 15–25 seconds",
  },
  {
    id: "gemini-3.1-flash-image-preview",
    label: "Gemini 3.1 Flash",
    endpoint: "fal-ai/gemini-3.1-flash-image-preview/edit",
    waitHint: "Image generate can take up to 5–10 seconds",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    endpoint: "openai/gpt-image-2/edit",
    waitHint: "Image generate can take up to 30–40 seconds",
  },
  {
    id: "grok-imagine",
    label: "Grok Imagine",
    endpoint: "xai/grok-imagine-image/edit",
    waitHint: "Image generate can take up to 8–15 seconds",
    extraInput: {
      aspect_ratio: "auto",
      resolution: "1k",
    },
  },
  {
    id: "grok-imagine-2",
    label: "Grok Imagine 2",
    endpoint: "xai/grok-imagine-image/v2.0/edit",
    waitHint: "Image generate can take up to 10–20 seconds",
    extraInput: {
      aspect_ratio: "auto",
      resolution: "1k",
      quality: "medium",
    },
  },
  {
    id: "grok-imagine-pro",
    label: "Grok Imagine Pro",
    endpoint: "xai/grok-imagine-image/quality/edit",
    waitHint: "Image generate can take up to 15–25 seconds",
    extraInput: {
      aspect_ratio: "auto",
      resolution: "1k",
    },
  },
  {
    id: "seedream-5-lite",
    label: "Seedream 5 Lite",
    endpoint: "fal-ai/bytedance/seedream/v5/lite/edit",
    waitHint: "Image generate can take up to 10–20 seconds",
  },
  {
    id: "seedream-5-pro",
    label: "Seedream 5 Pro",
    endpoint: "bytedance/seedream/v5/pro/edit",
    waitHint: "Image generate can take up to 15–30 seconds",
  },
] as const;

export type ModelId = (typeof IMAGE_EDIT_MODELS)[number]["id"];

export const DEFAULT_MODEL_ID: ModelId = "nano-banana";

export const MODEL_OPTIONS: { id: ModelId; label: string }[] =
  IMAGE_EDIT_MODELS.map(({ id, label }) => ({ id, label }));

const MODEL_BY_ID = Object.fromEntries(
  IMAGE_EDIT_MODELS.map((model) => [model.id, model])
) as Record<ModelId, (typeof IMAGE_EDIT_MODELS)[number]>;

export function isModelId(value: unknown): value is ModelId {
  return typeof value === "string" && value in MODEL_BY_ID;
}

export function resolveModelId(value: unknown): ModelId {
  return isModelId(value) ? value : DEFAULT_MODEL_ID;
}

export function getModelEndpoint(id: ModelId): string {
  return MODEL_BY_ID[id].endpoint;
}

export function getModelWaitHint(id: ModelId): string {
  return MODEL_BY_ID[id].waitHint;
}

export function buildEditInput(
  id: ModelId,
  prompt: string,
  imageUrl: string
): Record<string, unknown> {
  const extraInput =
    "extraInput" in MODEL_BY_ID[id] ? MODEL_BY_ID[id].extraInput : undefined;

  return {
    prompt,
    image_urls: [imageUrl],
    num_images: 1,
    ...extraInput,
  };
}
