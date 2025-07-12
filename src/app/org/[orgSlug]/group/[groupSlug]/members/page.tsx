import { notFound } from "next/navigation";
import MembersPageClient from "./client-page";
import { getCachedAuth, getOptionalGroup } from "@/lib/session";
import { isCurrentUserGroupOrOrgAdmin } from "@/lib/helpers/auth";
import { getGroupWithMemberships } from "@/lib/db/auth";

const getGroupMembers = async (groupId: string) => {
  const groupWithMembers = await getGroupWithMemberships(groupId);
  
  if (!groupWithMembers) {
    throw new Error("Group not found");
  }

  return groupWithMembers.memberships;
}

export default async function MembersPage() {
  try {
    const group = await getOptionalGroup();
    if (!group) {
      return <></>
    }

    const { userId } = await getCachedAuth();
    const [members, isAdmin] = await Promise.all([
      getGroupMembers(group.id),
      isCurrentUserGroupOrOrgAdmin(group.id).catch(() => false), // If it fails, user is not admin
    ]);

    return (
      <MembersPageClient
        groupId={group.id}
        members={members}
        isAdmin={isAdmin}
        sessionUserId={userId!}
      />
    );
  } catch (error) {
    console.error("Error loading members:", error);
    notFound();
  }
}
