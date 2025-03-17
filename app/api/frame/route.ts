import { type NextRequest, NextResponse } from "next/server"
import { validateFrameMessage, isVibesChannelMember, storeOptIn, hasOptedIn, type FrameRequest } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FrameRequest

    // Validate the frame message
    if (!body.trustedData?.messageBytes) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid request: No trusted data found",
        }),
        { status: 400 },
      )
    }

    const message = await validateFrameMessage(body.trustedData.messageBytes)
    if (!message) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid message signature",
        }),
        { status: 400 },
      )
    }

    const fid = body.untrustedData.fid
    const buttonIndex = body.untrustedData.buttonIndex

    // Check if user has already opted in
    const alreadyOptedIn = await hasOptedIn(fid)
    if (alreadyOptedIn) {
      return NextResponse.json({
        "fc:frame": "vNext",
        "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/already-opted-in`,
        "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
        "fc:frame:button:1": "Already Opted In ✅",
      })
    }

    // Initial frame - ask for wallet address
    if (buttonIndex === 1) {
      return NextResponse.json({
        "fc:frame": "vNext",
        "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/enter-address`,
        "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
        "fc:frame:input:text": "Enter your ETH wallet address",
        "fc:frame:button:1": "Submit",
      })
    }

    // User submitted their wallet address
    if (buttonIndex === 1 && body.untrustedData.inputText) {
      const walletAddress = body.untrustedData.inputText.trim()

      // Validate wallet address (basic check)
      if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
        return NextResponse.json({
          "fc:frame": "vNext",
          "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/invalid-address`,
          "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
          "fc:frame:input:text": "Enter a valid ETH address (0x...)",
          "fc:frame:button:1": "Try Again",
        })
      }

      // Check if user is a member of the /vibes channel
      const isMember = await isVibesChannelMember(fid)
      if (!isMember) {
        return NextResponse.json({
          "fc:frame": "vNext",
          "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/not-member`,
          "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
          "fc:frame:button:1": "Join /vibes Channel First",
        })
      }

      // Store the opt-in with wallet address
      const success = await storeOptIn(fid, walletAddress)

      if (success) {
        return NextResponse.json({
          "fc:frame": "vNext",
          "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/success`,
          "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
          "fc:frame:button:1": "Successfully Opted In! 🎉",
        })
      } else {
        return NextResponse.json({
          "fc:frame": "vNext",
          "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/error`,
          "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
          "fc:frame:button:1": "Try Again",
        })
      }
    }

    // Default response for any other case
    return NextResponse.json({
      "fc:frame": "vNext",
      "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og`,
      "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
      "fc:frame:button:1": "Opt into Airdrop",
    })
  } catch (error) {
    console.error("Error processing frame request:", error)
    return NextResponse.json({
      "fc:frame": "vNext",
      "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og/error`,
      "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
      "fc:frame:button:1": "Error: Try Again",
    })
  }
}

