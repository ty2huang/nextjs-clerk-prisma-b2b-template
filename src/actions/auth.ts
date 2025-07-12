"use server";

import { 
  createGroup, getUserFromId, getOrgFromId, createOrg, createUser, getGroupFromOrgAndSlug, 
  listUserGroupsForOrg, getGroupMembership, updateGroup, deleteGroup, removeUserFromGroup, 
  getGroupWithMemberships, addUserToGroup, updateGroupMembershipRole, listAllGroupsForOrg
} from "@/lib/db/auth";

import { clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import { getCachedAuth } from "../lib/clerk";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { groupRoles } from "@/lib/roles";
import { Group, User } from "@prisma/client";

// Organization Actions

export const getOrCreateOrgFromClerkIdAction = async (clerkOrgId: string) => {
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

// Organization Membership Actions

export async function getOrganizationMembersAction(): Promise<User[]> {
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
        name: `${member.publicUserData!.firstName || ''} ${member.publicUserData!.lastName || ''}`.trim() || 'Unnamed User',
        email: member.publicUserData!.identifier!
      }))
    );
  } catch (error) {
    console.error("Failed to fetch organization members:", error);
    throw new Error("Failed to fetch organization members");
  }
}

// User Actions

export const getOrCreateUserFromClerkIdAction = async (clerkUserId: string) => {
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

// Group Actions

export const getGroupFromSlugAction = async (slug: string) => {
  const { orgId } = await getCachedAuth();
  const group = await getGroupFromOrgAndSlug(orgId!, slug);
  return group;
}

export const getAllGroupsAction = async () => {
  const { orgId } = await getCachedAuth();
  const groups = await listAllGroupsForOrg(orgId!);
  return groups;
}

export const getUserGroupsAction = async () => {
  const { userId, orgId } = await getCachedAuth();
  const groups = await listUserGroupsForOrg(userId!, orgId!);
  return groups;
}

async function putLogo(logo: File | null) {
  if (!logo) return null;
  const fileExtension = logo?.name.split('.').pop() || '';
  const filename = `${randomUUID()}.${fileExtension}`;
  const blob = await put(filename, logo, { access: "public" });
  return blob.url;
}

export async function createGroupAction(name: string, slug: string, logo: File | null) {
  const { orgId, isAdmin } = await getCachedAuth();
  
  // Check if user is an admin
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  try {
    // Check if slug already exists in this organization (excluding current group)
    const existingGroup = await getGroupFromOrgAndSlug(orgId!, slug);
    if (existingGroup) {
      throw new Error("A group with this slug already exists within this organization");
    }

    // Handle logo upload if provided
    const logoUrl = await putLogo(logo);

    // Create the group
    const group = await createGroup(orgId!, name.trim(), slug.trim(), logoUrl);

    return { success: true, group };
  } catch (error) {
    console.error("Failed to create group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create group");
  }
} 

export async function updateGroupAction(groupId: string, name: string, slug: string, logo: File | null) {
  const { orgId } = await getCachedAuth();
  
  // Check if user is an admin (either org admin or group admin)
  const canUpdateGroup = await isSessionUserGroupOrOrgAdmin(groupId);
  
  if (!canUpdateGroup) {
    throw new Error("Forbidden - Admin role required");
  }

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  try {
    // Check if slug already exists in this organization (excluding current group)
    const existingGroup = await getGroupFromOrgAndSlug(orgId!, slug);
    if (existingGroup && existingGroup.id !== groupId) {
      throw new Error("A group with this slug already exists within this organization");
    }

    // Handle logo logic
    let logoUrl: string | null | undefined = undefined; // undefined means don't update
    
    if (logo && logo.name === "CLEAR_LOGO") {
      // User wants to clear the logo
      logoUrl = null;
    } else if (logo && logo.size > 0) {
      // User uploaded a new logo
      logoUrl = await putLogo(logo);
    }
    // If logo is null, we don't update the logo field (keep existing)

    // Update the group
    const updateData: { name: string; slug: string; logoUrl?: string | null } = {
      name: name.trim(),
      slug: slug.trim(),
    };
    
    // Only include logoUrl in update if it should be changed
    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl;
    }

    const updatedGroup = await updateGroup(groupId, updateData);

    return { success: true, group: updatedGroup };
  } catch (error) {
    console.error("Failed to update group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update group");
  }
}

export async function deleteGroupAction(groupId: string) {
  // Check if user is an admin (either org admin or group admin)
  const isAdmin = await isSessionUserGroupOrOrgAdmin(groupId);
  
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  try {
    await deleteGroup(groupId);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete group");
  }
}

// Group Membership Actions

export const isGroupMember = async (groupId: string) => {
  const { userId } = await getCachedAuth();
  const membership = await getGroupMembership(userId!, groupId);
  return !!membership;
}

export const validateGroupMembershipAction = cache( 
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

export const isSessionUserGroupOrOrgAdmin = cache(
  async (groupId: string) => {
    const { isAdmin } = await getCachedAuth();
    if (isAdmin) return true;
    
    const membership = await validateGroupMembershipAction(groupId);
    return membership.role === "admin";
  }
);

export const getGroupMembersAction = async (groupId: string) => {
  const groupWithMembers = await getGroupWithMemberships(groupId);
  
  if (!groupWithMembers) {
    throw new Error("Group not found");
  }

  return groupWithMembers.memberships;
}

export async function leaveGroupAction(groupId: string) {
  const { userId } = await getCachedAuth();
  
  try {
    await validateGroupMembershipAction(groupId);

    await removeUserFromGroup(userId!, groupId);
    return { success: true };
  } catch (error) {
    console.error("Failed to leave group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to leave group");
  }
}

export async function addUserToGroupAction(groupId: string, userId: string, role: string) {
  // Check if user is an admin (either org admin or group admin)
  const isAdmin = await isSessionUserGroupOrOrgAdmin(groupId);
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  try {
    // Check if user is already a member
    const existingMembership = await getGroupMembership(userId, groupId);
    if (existingMembership) {
      throw new Error("User is already a member of this group");
    }

    // Ensure user exists in our database
    await getOrCreateUserFromClerkIdAction(userId);

    // Add user to group as a member
    await addUserToGroup(userId, groupId, role);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to add user to group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to add user to group");
  }
}

export async function removeUserFromGroupAction(groupId: string, userId: string) {
  const isAdmin = await isSessionUserGroupOrOrgAdmin(groupId);
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  try {
    await removeUserFromGroup(userId, groupId);

    return { success: true };
  } catch (error) {
    console.error("Failed to remove user from group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to remove user from group");
  }
}

export async function updateGroupMembershipRoleAction(groupId: string, userId: string, newRole: string) {
  const isAdmin = await isSessionUserGroupOrOrgAdmin(groupId);
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  // Validate role
  const validRoles = groupRoles.map(role => role.name);
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  try {
    const membership = await updateGroupMembershipRole(groupId, userId, newRole);
    return { success: true, membership };
  } catch (error) {
    console.error("Failed to update membership role:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update membership role");
  }
}

// Current Group in Session Actions

export async function setCurrentGroupAction(group: Group) {
  const { userId, isAdmin } = await getCachedAuth();

  try {
    // Verify the user has access to this group
    if (!isAdmin) {
      await validateGroupMembershipAction(group.id);
    }

    // Update user's public metadata to include current group ID
    const clerk = await clerkClient();
    
    await clerk.users.updateUser(userId!, {
      publicMetadata: {
        currentGroup: group
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to set current group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to set current group");
  }
}

export async function clearCurrentGroupAction() {
  const { userId } = await getCachedAuth();

  try {
    const clerk = await clerkClient();
    
    await clerk.users.updateUser(userId!, {
      publicMetadata: { currentGroup: undefined }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to clear current group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to clear current group");
  }
}
