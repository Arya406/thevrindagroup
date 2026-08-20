import { Metadata } from "next";
import { SavedPropertiesManager } from "@/components/account/SavedPropertiesManager";

export const metadata: Metadata = {
  title: "Saved Properties | TheVrindaGroup",
  description: "View your shortlisted residential and commercial properties on TheVrindaGroup.",
};

export default function AccountSavedPage() {
  return <SavedPropertiesManager />;
}
