import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";
import { BRAND } from "@/config/brand";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thevrindagroup.com"),
  alternates: {
    canonical: "/",
  },
  title: `${BRAND.name} | Buy, Rent & Sell Properties`,
  description: BRAND.description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: `${BRAND.name} | Buy, Rent & Sell Properties`,
    description: BRAND.description,
    siteName: BRAND.name,
    images: [
      {
        url: "/logo.jpeg",
        width: 800,
        height: 800,
        alt: `${BRAND.name} Logo`,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | Buy, Rent & Sell Properties`,
    description: BRAND.description,
    images: ["/logo.jpeg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-light text-text-primary">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthRequiredModal />
        </AuthProvider>
      </body>
    </html>
  );
}
