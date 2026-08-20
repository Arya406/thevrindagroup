import { Metadata } from "next";
import { OverviewStats } from "@/components/account/OverviewStats";

export const metadata: Metadata = {
  title: "Account Overview | TheVrindaGroup",
  description: "View your active listings, leads, and upcoming visits on TheVrindaGroup.",
};

export default function AccountOverviewPage() {
  return <OverviewStats />;
}
