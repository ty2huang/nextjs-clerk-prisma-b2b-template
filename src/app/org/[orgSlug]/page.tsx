import { getCachedAuth } from "@/lib/session";
import OrgPageClient from "./client-page";
import { listAllGroupsForOrg, listUserGroupsForOrg } from "@/lib/db/auth";

const getAllGroups = async () => {
  const { orgId } = await getCachedAuth();
  const groups = await listAllGroupsForOrg(orgId!);
  return groups;
}

const getUserGroups = async () => {
  const { userId, orgId } = await getCachedAuth();
  const groups = await listUserGroupsForOrg(userId!, orgId!);
  return groups;
}

export default async function OrgPage() {
  // This will use the cached result from layout
  const { orgSlug: sessionOrgSlug, isAdmin } = await getCachedAuth();
  
  // Fetch data on the server
  const allGroups = await getAllGroups();
  const userGroups = await getUserGroups();
  
  return (
    <OrgPageClient
      allGroups={allGroups}
      userGroups={userGroups}
      isAdmin={isAdmin}
      sessionOrgSlug={sessionOrgSlug!}
    />
  );
}