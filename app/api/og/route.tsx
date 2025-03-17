import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        fontSize: 60,
        color: "white",
        background: "linear-gradient(to right, #8b5cf6, #ec4899)",
        width: "100%",
        height: "100%",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 50,
      }}
    >
      <div style={{ fontSize: 80, fontWeight: "bold", marginBottom: 20 }}>/vibes Channel</div>
      <div style={{ fontSize: 60, marginBottom: 40 }}>Exclusive Airdrop</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.1)",
          padding: "20px 40px",
          borderRadius: 20,
        }}
      >
        <div style={{ marginRight: 20 }}>🎁</div>
        <div>Opt in now!</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}

