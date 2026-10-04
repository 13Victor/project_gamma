import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Adivina el campeón del día`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-foreground/10">
          <nav
            aria-label="Principal"
            className="mx-auto flex w-full max-w-3xl items-center gap-6 px-4 py-3 text-sm font-medium"
          >
            <Link href="/" className="font-semibold">
              {SITE_NAME}
            </Link>
            <Link href="/clasico">Clásico</Link>
            <Link href="/como-jugar">Cómo jugar</Link>
          </nav>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
