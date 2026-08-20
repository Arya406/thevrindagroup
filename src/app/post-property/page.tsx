import { Metadata } from "next";
import { Suspense } from "react";
import { PostPropertyWizard } from "@/components/post-property/PostPropertyWizard";

export const metadata: Metadata = {
  title: "Post Property FREE | List Residential & Commercial Real Estate | TheVrindaGroup",
  description:
    "List your property on TheVrindaGroup for free. Connect with verified buyers and tenants across India's top cities with zero brokerage.",
};

export default function PostPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs font-semibold text-text-muted">
          Loading Property Wizard...
        </div>
      }
    >
      <PostPropertyWizard />
    </Suspense>
  );
}
