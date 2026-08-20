import { Metadata } from "next";
import { VisitsManager } from "@/components/account/VisitsManager";

export const metadata: Metadata = {
  title: "Scheduled Visits | TheVrindaGroup",
  description: "Track and manage upcoming buyer property visits on TheVrindaGroup.",
};

export default function AccountVisitsPage() {
  return <VisitsManager />;
}
