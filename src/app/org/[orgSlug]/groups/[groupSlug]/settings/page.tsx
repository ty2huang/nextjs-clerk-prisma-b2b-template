import { isCurrentUserGroupOrOrgAdmin } from "@/lib/helpers/auth";
import { getGroupMembership } from "@/lib/db/auth";
import { getCachedAuth, getOptionalGroup } from "@/lib/session";
import GroupSettingsClient from "./client-page";

export default async function GroupSettingsPage() {
  // Get group data
  const group = await getOptionalGroup();
  if (!group) {
    return <></>
  }

  // Get user permissions and membership
  const { userId } = await getCachedAuth();
  const [isGroupAdmin, directMembership] = await Promise.all([
    isCurrentUserGroupOrOrgAdmin(group.id),
    getGroupMembership(userId!, group.id)
  ]);

  // User is a direct member if they have a membership record
  const isDirectMember = !!directMembership;

  return (
    <GroupSettingsClient
      group={group}
      isUserAdmin={isGroupAdmin}
      isDirectMember={isDirectMember}
    />
  );
}
