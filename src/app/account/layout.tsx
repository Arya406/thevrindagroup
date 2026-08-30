import { Metadata } from "next";
import { AccountLayout } from "@/components/account/AccountLayout";

export const metadata: Metadata = {
  title: "My Account | TheVrindaGroup Real Estate Portal",
  description: "Manage your listed properties, customer leads, and visits on TheVrindaGroup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayout>{children}</AccountLayout>;
}
