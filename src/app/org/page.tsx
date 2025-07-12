import { getCachedAuth } from "@/lib/clerk";
import { redirect } from "next/navigation";

export default async function OrgRedirectPage() {
  // Get auth info from Clerk
  const { orgSlug } = await getCachedAuth();
  
  if (orgSlug) {
    redirect(`/org/${orgSlug}`);
  }
  else {
    redirect("/");
  }
}