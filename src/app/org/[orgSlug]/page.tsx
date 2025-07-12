import { getCachedAuth } from "@/lib/clerk";
import OrgPageClient from "./client-page";
import { getAllGroupsAction, getUserGroupsAction } from "@/actions/auth";

export default async function OrgPage() {
  // This will use the cached result from layout
  const { orgSlug: sessionOrgSlug, isAdmin } = await getCachedAuth();
  
  // Fetch data on the server
  const allGroups = await getAllGroupsAction();
  const userGroups = await getUserGroupsAction();

  return (
    <OrgPageClient
      allGroups={allGroups}
      userGroups={userGroups}
      isAdmin={isAdmin}
      sessionOrgSlug={sessionOrgSlug!}
    />
  );
}