import { Metadata } from "next";
import { PropertiesManager } from "@/components/account/PropertiesManager";

export const metadata: Metadata = {
  title: "My Properties | TheVrindaGroup",
  description: "Manage your active listings, drafts, and sold properties on TheVrindaGroup.",
};

export default function AccountPropertiesPage() {
  return <PropertiesManager />;
}
