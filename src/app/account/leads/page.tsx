import { Metadata } from "next";
import { LeadsManager } from "@/components/account/LeadsManager";

export const metadata: Metadata = {
  title: "Leads & Enquiries | TheVrindaGroup",
  description: "View and respond to incoming buyer and tenant enquiries on TheVrindaGroup.",
};

export default function AccountLeadsPage() {
  return <LeadsManager />;
}
