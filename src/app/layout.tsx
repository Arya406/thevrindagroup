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
  title: `${BRAND.name} | Buy, Rent & Sell Properties`,
  description: BRAND.description,
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
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
