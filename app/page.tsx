import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "/vibes Airdrop Frame",
  description: "Opt into the /vibes channel airdrop",
  openGraph: {
    title: "/vibes Airdrop Frame",
    description: "Opt into the /vibes channel airdrop",
    images: ["/api/og"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `https://bb-v0-7-days-of-vibes.vercel.app/api/og`,
    "fc:frame:post_url": `https://bb-v0-7-days-of-vibes.vercel.app/api/frame`,
    "fc:frame:button:1": "Opt into Airdrop",
  },
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-r from-purple-500 to-pink-500">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-6">/vibes Channel Airdrop</h1>
          <p className="text-lg text-center mb-8">
            This is a Farcaster Frame that allows members of the /vibes channel to opt into an upcoming airdrop.
          </p>
          <div className="flex justify-center">
            <div className="w-full h-[300px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl p-6 text-center">
              <div>
                <p className="text-2xl font-bold mb-4">/vibes Channel Exclusive Airdrop</p>
                <p>🎁 Opt in now by viewing this in a Farcaster client!</p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600">
            <p className="font-bold">This frame must be viewed in a Farcaster client to interact with it.</p>
            <p className="mt-2">
              Try posting this URL in Warpcast:{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">https://bb-v0-7-days-of-vibes.vercel.app</span>
            </p>
            <p className="mt-4 text-sm">
              Admin dashboard available at{" "}
              <a href="/admin" className="text-purple-600 hover:underline">
                /admin
              </a>{" "}
              (requires authentication)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

