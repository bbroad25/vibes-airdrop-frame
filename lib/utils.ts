import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs"

// Neynar API key - using environment variable but with fallback
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "AD42AABF-D77B-4F29-94C7-2AEA56403B98"

// Create a Redis client only on the server side
let redisClient: any = null

// This function will be called only on the server
export async function getRedisClient() {
  // Only import Redis on the server side
  if (typeof window === "undefined") {
    if (!redisClient) {
      // Dynamically import Redis to avoid client-side imports
      const { createClient } = await import("redis")
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          tls: true,
          rejectUnauthorized: false,
        },
      })
    }

    if (!redisClient.isOpen) {
      await redisClient.connect()
    }
  }

  return redisClient
}

export interface FrameRequest {
  untrustedData: {
    fid: number
    url: string
    messageHash: string
    timestamp: number
    network: number
    buttonIndex: number
    castId: {
      fid: number
      hash: string
    }
    inputText?: string
  }
  trustedData?: {
    messageBytes: string
  }
}

export async function validateFrameMessage(message: string): Promise<Message | null> {
  try {
    const hubClient = getSSLHubRpcClient(process.env.FARCASTER_HUB_URL || "nemes.farcaster.xyz:2283")
    const messageBuffer = Buffer.from(message, "hex")
    const result = await hubClient.validateMessage(messageBuffer)

    if (!result.isOk() || !result.value.valid) {
      return null
    }

    const parsedMessage = Message.decode(messageBuffer)
    return parsedMessage
  } catch (error) {
    console.error("Error validating message:", error)
    return null
  }
}

export async function isVibesChannelMember(fid: number): Promise<boolean> {
  try {
    // Using Neynar API to check if user follows the /vibes channel
    const response = await fetch(`https://api.neynar.com/v2/farcaster/channel/vibes/followers?with_fid=${fid}`, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
    })

    if (!response.ok) {
      console.warn("Could not verify channel membership with Neynar, using fallback logic")
      return fid % 2 === 0 // Simple test: even FIDs are "members"
    }

    const data = await response.json()
    // Check if the user is in the followers list
    return data.followers.some((follower: any) => follower.fid === fid)
  } catch (error) {
    console.error("Error checking channel membership:", error)
    // Fallback logic for testing
    return fid % 2 === 0 // Simple test: even FIDs are "members"
  }
}

export async function storeOptIn(fid: number, address?: string): Promise<boolean> {
  try {
    const client = await getRedisClient()
    const timestamp = Date.now()

    await client.hSet(`optins:${fid}`, {
      fid: fid.toString(),
      address: address || "",
      timestamp: timestamp.toString(),
    })

    // Also add to a list for easy retrieval of all opt-ins
    await client.zAdd("optins:all", [
      {
        score: timestamp,
        value: fid.toString(),
      },
    ])

    // Send notification to Neynar webhook
    try {
      await fetch("https://api.neynar.com/f/app/b9bd9e3d-0304-4871-b4f2-a0d228e3dd1a/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: NEYNAR_API_KEY,
        },
        body: JSON.stringify({
          event_type: "opt_in",
          fid: fid,
          address: address || "",
          timestamp: timestamp,
        }),
      })
    } catch (webhookError) {
      // Log but don't fail if webhook notification fails
      console.error("Error sending webhook notification:", webhookError)
    }

    return true
  } catch (error) {
    console.error("Error storing opt-in:", error)
    return false
  }
}

export async function hasOptedIn(fid: number): Promise<boolean> {
  try {
    const client = await getRedisClient()
    const data = await client.hGetAll(`optins:${fid}`)
    return Object.keys(data).length > 0
  } catch (error) {
    console.error("Error checking opt-in status:", error)
    return false
  }
}

export async function getAllOptIns(limit = 100, offset = 0): Promise<any[]> {
  try {
    const client = await getRedisClient()

    // Get the FIDs of users who have opted in, sorted by timestamp (newest first)
    const fids = await client.zRange("optins:all", offset, offset + limit - 1, {
      REV: true,
    })

    // Get the details for each FID
    const optIns = []
    for (const fid of fids) {
      const data = await client.hGetAll(`optins:${fid}`)
      if (Object.keys(data).length > 0) {
        optIns.push(data)
      }
    }

    return optIns
  } catch (error) {
    console.error("Error getting all opt-ins:", error)
    return []
  }
}

export async function getFarcasterUserInfo(fid: number): Promise<any> {
  try {
    // Using Neynar API to get user info
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error getting user info:", error)
    return null
  }
}

export async function getRecentWebhookEvents(limit = 10): Promise<any[]> {
  try {
    const client = await getRedisClient()
    const events = await client.lRange("webhook:events", 0, limit - 1)
    return events.map((event) => JSON.parse(event))
  } catch (error) {
    console.error("Error fetching webhook events:", error)
    return []
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

