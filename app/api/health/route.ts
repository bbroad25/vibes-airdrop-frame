import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/utils"

export async function GET() {
  try {
    // Test Redis connection
    const redisClient = await getRedisClient()
    await redisClient.set("health_check", "ok")
    const result = await redisClient.get("health_check")

    return NextResponse.json({
      status: "ok",
      redis: result === "ok" ? "connected" : "error",
      farcasterHub: process.env.FARCASTER_HUB_URL || "nemes.farcaster.xyz:2283",
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "not set",
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

