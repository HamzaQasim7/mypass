import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // The app now works in hybrid mode: local by default, optional cloud sync
  return await updateSession(request)
}

export const config = {
  matcher: ["/api/:path*"],
}
