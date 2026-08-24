// ==============================================================================
// TheVrindaGroup - Temporary Redirect: /sell-property -> /post-property
// ==============================================================================

import { redirect } from "next/navigation";

export default function SellPropertyRedirectPage() {
  redirect("/post-property");
}
