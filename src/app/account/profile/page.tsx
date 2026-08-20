import { Metadata } from "next";
import { ProfileSettingsManager } from "@/components/account/ProfileSettingsManager";

export const metadata: Metadata = {
  title: "Profile Settings | TheVrindaGroup",
  description: "Configure your account details and notification preferences on TheVrindaGroup.",
};

export default function AccountProfilePage() {
  return <ProfileSettingsManager />;
}
