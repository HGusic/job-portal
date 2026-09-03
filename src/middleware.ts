import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAdminAppUrl, isAdminHost, isEmployerPath } from "@/lib/hosts";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;
  const onAdmin = isAdminHost(host);

  if (!onAdmin && isEmployerPath(pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (onAdmin) {
    if (pathname === "/" || pathname.startsWith("/jobs")) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const dest = token ? "/admin/jobs" : "/admin/login";
      return NextResponse.redirect(new URL(dest, getAdminAppUrl()));
    }

    const isLogin = pathname === "/admin/login";
    const needsAuth =
      pathname.startsWith("/admin") && !isLogin;
    if (needsAuth) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        const login = new URL("/admin/login", getAdminAppUrl());
        login.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(login);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
