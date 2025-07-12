import { cache } from "react";
import { createUser, getGroupMembership, getUserFromId } from "../db/auth";
import { clerkClient } from "@clerk/nextjs/server";
import { getCachedAuth } from "../session";

// User Actions

export const getOrCreateUserFromClerkId = async (clerkUserId: string) => {
  const user = await getUserFromId(clerkUserId);
  
  // Sync clerk user to db if not exists
  if (!user){
    const clerk = await clerkClient();
    const userData = await clerk.users.getUser(clerkUserId);
    if (!userData) throw new Error("User not found");
    const { firstName, lastName, emailAddresses } = userData;
    const newUser = await createUser(clerkUserId, `${firstName} ${lastName}`, emailAddresses[0].emailAddress);
    return newUser;
  }

  return user;
}

// Group Membership

export const validateGroupMembership = cache( 
  async (groupId: string) => {
    const { userId } = await getCachedAuth();
    const membership = await getGroupMembership(userId!, groupId);
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
