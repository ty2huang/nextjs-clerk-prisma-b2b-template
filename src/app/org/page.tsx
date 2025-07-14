import { getCachedAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { protocol, rootDomain } from "@/lib/utils";

export default async function OrgRedirectPage() {
  // Get auth info from Clerk
  const { orgSlug } = await getCachedAuth();
  
  if (orgSlug) {
    const url = `${protocol}://${orgSlug}.${rootDomain}/app`;
    redirect(url);
  }
  else {
    const url = `${protocol}://${rootDomain}`;
    redirect(url);
  }
}