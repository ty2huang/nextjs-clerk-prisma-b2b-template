import { notFound } from "next/navigation";
import MembersPageClient from "./client-page";
import { getCachedAuth, getOptionalGroup } from "@/lib/session";
import { getOrganizationMembers, isCurrentUserGroupOrOrgAdmin, MembershipWithNameAndEmail } from "@/lib/helpers/auth";
import { getGroupWithMemberships, MembershipWithUser } from "@/lib/db/auth";
import { clerkClient } from "@clerk/nextjs/server";

const getGroupMembers = async (groupId: string) => {
  const groupWithMembers = await getGroupWithMemberships(groupId);
  
  if (!groupWithMembers) {
    throw new Error("Group not found");
  }

  return groupWithMembers.memberships;
}

const addNameAndEmailToMemberships = async (memberships: MembershipWithUser[]): Promise<MembershipWithNameAndEmail[]> => {
  const clerk = await clerkClient();
  
  // Fetch user details from Clerk for each membership
  const userDetailsPromises = memberships.map(async (membership) => {
    try {
      const clerkUser = await clerk.users.getUser(membership.user.clerkId);
      return {
        ...membership,
        user: {
          clerkId: membership.user.clerkId,
          createdAt: membership.user.createdAt,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unnamed User',
          email: clerkUser.emailAddresses?.[0]?.emailAddress || 'No email',
        }
      };
    } catch (error) {
      console.error(`Failed to fetch user details for ${membership.user.clerkId}:`, error);
      // Return fallback data if Clerk API fails
      return {
        ...membership,
        user: { 
          clerkId: membership.user.clerkId,
          createdAt: membership.user.createdAt,
          name: 'Unnamed User',
          email: 'No email',
        }
      };
    }
  });

  return Promise.all(userDetailsPromises);
}

export default async function MembersPage() {
  try {
    const group = await getOptionalGroup();
    if (!group) {
      return <></>
    }

    const { userId } = await getCachedAuth();
    const [memberships, orgMembers, isAdmin] = await Promise.all([
      getGroupMembers(group.id),
      getOrganizationMembers(),
      isCurrentUserGroupOrOrgAdmin(group.id).catch(() => false), // If it fails, user is not admin
    ]);
    const groupMemberships = await addNameAndEmailToMemberships(memberships);

    return (
      <MembersPageClient
        groupId={group.id}
        groupMemberships={groupMemberships}
        orgMembers={orgMembers}
        isAdmin={isAdmin}
        sessionUserId={userId!}
      />
    );
  } catch (error) {
    console.error("Error loading members:", error);
    notFound();
  }
}
