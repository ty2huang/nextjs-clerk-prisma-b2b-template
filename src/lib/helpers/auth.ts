import { cache } from "react";
import { createUser, getGroupMembership, getUserFromId } from "../db/auth";
import { getCachedAuth } from "../session";
import { clerkClient } from "@clerk/nextjs/server";
import { GroupMembership } from "@prisma/client";

// User Actions

export const getOrCreateUserFromClerkId = async (clerkUserId: string) => {
  const user = await getUserFromId(clerkUserId);
  
  // Sync clerk user to db if not exists
  if (!user){
    const newUser = await createUser(clerkUserId);
    return newUser;
  }

  return user;
}

// Group Membership

export const validateGroupMembership = cache( 
  async (groupId: string) => {
    const { userId } = await getCachedAuth();
    const membership = await getGroupMembership(groupId, userId!);
    if (!membership) {
      console.error(`User ${userId} is not a member of group ${groupId}`);
      throw new Error(`User is not a member of group`);
    }
    return membership;
  }
);

export const isCurrentUserGroupOrOrgAdmin = cache(
  async (groupId: string) => {
    const { isAdmin } = await getCachedAuth();
    if (isAdmin) return true;
    
    const membership = await validateGroupMembership(groupId);
    return membership.role === "admin";
  }
);

// Organization Membership

export type UserWithNameAndEmail = {
  clerkId: string;
  createdAt: Date;
  name: string;
  email: string;
}

export type MembershipWithNameAndEmail = GroupMembership & {
  user: UserWithNameAndEmail;
}

export async function getOrganizationMembers(): Promise<UserWithNameAndEmail[]> {
  const { orgId } = await getCachedAuth();
  
  try {
    const clerk = await clerkClient();
    const orgMembers = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId!
    });

    return (orgMembers.data
      .filter(member => member.publicUserData) // Filter out members without public user data
      .map(member => ({
        clerkId: member.publicUserData!.userId!,
        createdAt: new Date(member.createdAt),
        name: `${member.publicUserData!.firstName || ''} ${member.publicUserData!.lastName || ''}`.trim() || 'Unnamed User',
        email: member.publicUserData!.identifier!
      }))
    );
  } catch (error) {
    console.error("Failed to fetch organization members:", error);
    throw new Error("Failed to fetch organization members");
  }
}
