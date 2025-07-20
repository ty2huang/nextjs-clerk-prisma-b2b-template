import { redirect } from "next/navigation";
import { getCachedAuth } from "@/lib/session";
import { getOrgFromId, createOrg } from "@/lib/db/auth";
import { getOrCreateUserFromClerkId } from "@/lib/helpers/auth";
import { rootDomain, protocol } from "@/lib/utils";

const getOrCreateOrgFromClerkId = async (clerkOrgId: string) => {
  const org = await getOrgFromId(clerkOrgId);
  
  // Sync clerk org to db if not exists
  if (!org) {
    const newOrg = await createOrg(clerkOrgId);
    return newOrg;
  }
  
  return org;
}

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

// Create a wrapper component that provides auth data
export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;

  const { orgSlug: sessionOrgSlug, userId, orgId } = await getCachedAuth();

  // If they are not equal, this means that the organization sync in the middleware failed
  if (orgSlug !== sessionOrgSlug) {
    redirect(`${protocol}://${rootDomain}`); // Redirect to organization selection page
  }

  // Ensure the user and org exist in the database
  await getOrCreateUserFromClerkId(userId!);
  await getOrCreateOrgFromClerkId(orgId!);

  return (
    <>
      {children}
    </>
  );
}
