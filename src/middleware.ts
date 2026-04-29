import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;
  const role = (session?.user as { role?: string } | null)?.role;

  if (path.startsWith("/student") && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/company") && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/company") && role !== "COMPANY") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/student/:path*", "/company/:path*"],
};
