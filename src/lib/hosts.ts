function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function getPublicAppUrl() {
  return stripTrailingSlash(process.env.PUBLIC_APP_URL ?? "http://localhost:3000");
}

export function getAdminAppUrl() {
  return stripTrailingSlash(process.env.ADMIN_APP_URL ?? "http://admin.localhost:3000");
}

export function hostFromAppUrl(appUrl: string) {
  return new URL(appUrl).host.toLowerCase();
}

export function isAdminHost(requestHost: string | null | undefined) {
  if (!requestHost) return false;
  return requestHost.toLowerCase() === hostFromAppUrl(getAdminAppUrl());
}

export function isPublicHost(requestHost: string | null | undefined) {
  if (!requestHost) return false;
  return requestHost.toLowerCase() === hostFromAppUrl(getPublicAppUrl());
}

export function isEmployerPath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/auth")
  );
}
