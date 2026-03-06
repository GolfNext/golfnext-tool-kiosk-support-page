import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export interface PortalUser {
  sub: string;
  email: string;
  name: string;
  groups: string[];
  iat: number;
  exp: number;
}

/**
 * Verify the JWT token from the GolfNext Portal.
 * Returns the decoded user payload if valid, null if invalid.
 */
export async function verifyPortalToken(
  token: string
): Promise<PortalUser | null> {
  try {
    const publicKey = process.env.PORTAL_JWT_PUBLIC_KEY;
    if (!publicKey) {
      console.error("PORTAL_JWT_PUBLIC_KEY is not set");
      return null;
    }

    const secret = new TextEncoder().encode(publicKey);
    const { payload } = await jwtVerify(token, secret);

    return payload as unknown as PortalUser;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract the Bearer token from an Authorization header.
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Middleware helper for API routes that require authentication.
 * Use in API route handlers:
 *
 *   const user = await requireAuth(request);
 *   if (user instanceof NextResponse) return user; // Error response
 *   // user is now a verified PortalUser
 */
export async function requireAuth(
  request: NextRequest
): Promise<PortalUser | NextResponse> {
  const token = extractBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required", code: "AUTH_MISSING" },
      { status: 401 }
    );
  }

  const user = await verifyPortalToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token", code: "AUTH_INVALID" },
      { status: 401 }
    );
  }

  return user;
}
