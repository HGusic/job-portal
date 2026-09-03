import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import { getPracticeName } from "@/lib/config";
import { getAdminAppUrl, getPublicAppUrl, isAdminHost } from "@/lib/hosts";
import { getAdminSession } from "@/lib/session";
import { SignOutButton } from "./admin/sign-out-button";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.PRACTICE_NAME ?? "Practice"} Careers`,
  description: "Open positions and applications",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const practice = getPracticeName();
  const headerList = await headers();
  const onAdmin = isAdminHost(headerList.get("host"));
  const session = onAdmin ? await getAdminSession() : null;
  const isEmployer = Boolean(session?.user?.id);
  const publicUrl = getPublicAppUrl();
  const adminUrl = getAdminAppUrl();

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {onAdmin ? (
          <Providers>
            <Header
              practice={practice}
              onAdmin
              isEmployer={isEmployer}
              publicUrl={publicUrl}
              adminUrl={adminUrl}
            />
            <main className="w-full flex-1 px-3 py-6 sm:px-4">{children}</main>
            <footer className="border-t border-[#e4ddd3] py-6 text-center text-sm text-[#5b675f]">
              {practice} employer portal
            </footer>
          </Providers>
        ) : (
          <>
            <Header
              practice={practice}
              onAdmin={false}
              isEmployer={false}
              publicUrl={publicUrl}
              adminUrl={adminUrl}
            />
            <main className="w-full flex-1 px-3 py-6 sm:px-4">{children}</main>
            <footer className="border-t border-[#e4ddd3] py-6 text-center text-sm text-[#5b675f]">
              {practice} careers
            </footer>
          </>
        )}
      </body>
    </html>
  );
}

function Header({
  practice,
  onAdmin,
  isEmployer,
  publicUrl,
  adminUrl,
}: {
  practice: string;
  onAdmin: boolean;
  isEmployer: boolean;
  publicUrl: string;
  adminUrl: string;
}) {
  return (
    <header className="border-b border-[#e4ddd3] bg-[#fffcf8]">
      <div className="flex w-full items-center justify-between px-3 py-4 sm:px-4">
        <div className="flex items-center gap-3">
          <Link
            href={onAdmin ? `${adminUrl}/admin/jobs` : "/"}
            className="text-lg font-semibold tracking-tight text-[#115e59]"
          >
            {practice}
          </Link>
          {onAdmin && isEmployer ? (
            <span className="rounded-full border border-[#cde7e3] bg-[#f3faf8] px-2.5 py-0.5 text-xs font-medium text-[#115e59]">
              Logged in as employer
            </span>
          ) : onAdmin ? (
            <span className="rounded-full border border-[#e4ddd3] px-2.5 py-0.5 text-xs font-medium text-[#5b675f]">
              Employer portal
            </span>
          ) : null}
        </div>
        <nav className="flex items-center gap-5 text-sm text-[#5b675f]">
          {onAdmin ? (
            <>
              <Link href="/admin/jobs" className="hover:text-[#115e59]">
                Home
              </Link>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#115e59]">
                View public site
              </a>
              {isEmployer ? <SignOutButton /> : null}
            </>
          ) : (
            <Link href="/" className="hover:text-[#115e59]">
              Open roles
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
