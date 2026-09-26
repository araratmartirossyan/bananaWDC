import { type NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { rateLimiter, getClientIP } from "@/lib/rate-limiter";
import { getFilterPrompt } from "@/lib/filters-store";
import {
  buildEditInput,
  getModelEndpoint,
  resolveModelId,
} from "@/lib/models";

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimiter.isAllowed(clientIP);

    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime || 0).toISOString();
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime,
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const { imageUrl, filter, model: requestModel } = await request.json();

    if (!imageUrl || !filter) {
      return NextResponse.json(
        { error: "Image URL and filter are required" },
        { status: 400 }
      );
    }

    const model = resolveModelId(requestModel);
    const endpoint = getModelEndpoint(model);

    if (filter === "none") {
      return NextResponse.json(
        { processedImageUrl: imageUrl },
        {
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining":
              rateLimitResult.remaining?.toString() || "0",
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime || 0
            ).toISOString(),
          },
        }
      );
    }

    const prompt = await getFilterPrompt(filter);
    if (prompt === null || prompt === "") {
      return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
    }

    console.log("weDat Processing image with", endpoint, ":", filter);
    console.log("weDat Using dramatic transformation prompt");

    const result = await fal.subscribe(endpoint, {
      input: buildEditInput(model, prompt, imageUrl),
    });

    console.log("weDat Nano Banana transformation result:", result);

    const processedImageUrl = result.data?.images?.[0]?.url;

    if (!processedImageUrl) {
      throw new Error("No processed image returned from Nano Banana");
    }

    console.log("weDat Returning processed image without watermark");

    return NextResponse.json(
      {
        processedImageUrl: processedImageUrl,
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
          "X-RateLimit-Reset": new Date(
            rateLimitResult.resetTime || 0
          ).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("weDat Error with Nano Banana processing:", error);
    return NextResponse.json(
      {
        error: "Failed to process image with Nano Banana",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
