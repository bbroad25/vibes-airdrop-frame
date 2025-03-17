import { type NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/utils"

// This endpoint will receive webhook notifications from Neynar
export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Neynar (in production, add more robust verification)
    const apiKey = req.headers.get("api_key")
    if (!apiKey || apiKey !== process.env.NEYNAR_API_KEY) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const body = await req.json()
    console.log("Received webhook notification:", JSON.stringify(body))

    // Log the event to Redis for analytics
    try {
      const client = await getRedisClient()
      await client.lPush(
        "webhook:events",
        JSON.stringify({
          ...body,
          received_at: Date.now(),
        }),
      )

      // Keep only the last 1000 events
      await client.lTrim("webhook:events", 0, 999)
    } catch (redisError) {
      console.error("Error logging webhook event to Redis:", redisError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

