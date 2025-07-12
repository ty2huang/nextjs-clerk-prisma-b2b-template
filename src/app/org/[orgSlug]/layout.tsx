import { redirect } from "next/navigation";
import { getCachedAuth } from "@/lib/session";
import { getOrgFromId, createOrg } from "@/lib/db/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { getOrCreateUserFromClerkId } from "@/lib/helpers/auth";

const getOrCreateOrgFromClerkId = async (clerkOrgId: string) => {
  const org = await getOrgFromId(clerkOrgId);
  
  // Sync clerk org to db if not exists
  if (!org) {
    const clerk = await clerkClient();
    const { name, slug } = await clerk.organizations.getOrganization({
      organizationId: clerkOrgId,
    });
    const newOrg = await createOrg(clerkOrgId, name, slug);
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

  // Redirect to home if user is not authenticated
  if (!userId) {
    redirect("/");
  }

  // If there's no active organization in the session, redirect to home
  if (!sessionOrgSlug || !orgId) {
    redirect("/");
  }

  // Check if the URL orgSlug matches the session orgSlug
  if (orgSlug !== sessionOrgSlug) {
    redirect("/");
  }

  // Ensure the user and org exist in the database
  await getOrCreateUserFromClerkId(userId);
  await getOrCreateOrgFromClerkId(orgId);

  return (
    <>
      {children}
    </>
  );
}
