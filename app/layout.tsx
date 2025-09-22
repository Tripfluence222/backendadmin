import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "Tripfluence Admin — Branded Web Manager",
  description: "Comprehensive admin dashboard for managing Tripfluence operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased m-0 p-0`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
