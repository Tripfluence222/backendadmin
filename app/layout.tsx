import type { Metadata } from "next";
import GeistSans from "geist/font/sans";
import GeistMono from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geistSans = GeistSans({
  variable: "--font-geist-sans",
});

const geistMono = GeistMono({
  variable: "--font-geist-mono",
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
