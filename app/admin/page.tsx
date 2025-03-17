"use client"

import { getAllOptIns, getFarcasterUserInfo, getRecentWebhookEvents } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const optIns = await getAllOptIns(100, 0)

  // Get recent webhook events
  const webhookEvents = await getRecentWebhookEvents(10)

  // Enhance opt-ins with user info where possible
  const enhancedOptIns = await Promise.all(
    optIns.map(async (optIn) => {
      const fid = Number.parseInt(optIn.fid)
      const userInfo = await getFarcasterUserInfo(fid)
      return {
        ...optIn,
        username: userInfo?.username || "Unknown",
        displayName: userInfo?.displayName || "Unknown User",
        pfp: userInfo?.pfp?.url || null,
        formattedDate: new Date(Number.parseInt(optIn.timestamp)).toLocaleString(),
      }
    }),
  )

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">/vibes Airdrop Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Opt-In Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-100 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Total Opt-Ins</p>
              <p className="text-3xl font-bold">{enhancedOptIns.length}</p>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg">
              <p className="text-sm text-pink-600">With Wallet Address</p>
              <p className="text-3xl font-bold">
                {enhancedOptIns.filter((o) => o.address && o.address.startsWith("0x")).length}
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Last 24 Hours</p>
              <p className="text-3xl font-bold">
                {enhancedOptIns.filter((o) => Date.now() - Number.parseInt(o.timestamp) < 24 * 60 * 60 * 1000).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Webhook Events</h2>

          {webhookEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      FID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhookEvents.map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.event_type || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.fid || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.received_at ? new Date(event.received_at).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <details>
                          <summary>View Details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(event, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No webhook events received yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Opt-In List</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    FID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Wallet Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enhancedOptIns.map((optIn, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {optIn.pfp && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img className="h-10 w-10 rounded-full" src={optIn.pfp || "/placeholder.svg"} alt="" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{optIn.displayName}</div>
                          <div className="text-sm text-gray-500">@{optIn.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{optIn.fid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{optIn.address || "Not provided"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{optIn.formattedDate}</td>
                  </tr>
                ))}

                {enhancedOptIns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No opt-ins yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Export Data</h3>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              onClick={() => {
                const csv = [
                  ["FID", "Username", "Display Name", "Wallet Address", "Timestamp"],
                  ...enhancedOptIns.map((o) => [o.fid, o.username, o.displayName, o.address || "", o.formattedDate]),
                ]
                  .map((row) => row.join(","))
                  .join("\n")

                const blob = new Blob([csv], { type: "text/csv" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "vibes-airdrop-optins.csv"
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
              }}
            >
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

