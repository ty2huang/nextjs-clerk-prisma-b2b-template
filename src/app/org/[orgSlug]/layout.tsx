import { redirect } from "next/navigation";
import { getCachedAuth } from "@/lib/clerk";
import { getOrCreateOrgFromClerkIdAction, getOrCreateUserFromClerkIdAction } from "@/actions/auth";

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
  await getOrCreateUserFromClerkIdAction(userId);
  await getOrCreateOrgFromClerkIdAction(orgId);

  return (
    <>
      {children}
    </>
  );
}
