import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")

    return response
  }

  // Basic auth for admin routes
  if (pathname.startsWith("/admin")) {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !isValidAuthHeader(authHeader)) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      })
    }
  }

  return NextResponse.next()
}

function isValidAuthHeader(authHeader: string): boolean {
  // This is a very basic implementation
  // In production, you would want to use environment variables for credentials
  const base64Credentials = authHeader.split(" ")[1]
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii")
  const [username, password] = credentials.split(":")

  // Replace with your desired username/password
  return username === "admin" && password === "vibesadmin"
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
}

