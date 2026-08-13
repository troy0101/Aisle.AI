export { default } from "next-auth/middleware";

// Gate everything under /dashboard behind a session; unauthenticated users
// get bounced to /login. API routes handle their own auth checks separately
// since they need JSON error responses rather than a redirect.
export const config = {
  matcher: ["/dashboard/:path*"]
};
