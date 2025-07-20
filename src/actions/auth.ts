"use server";

import { 
  createGroup, updateGroup, deleteGroup, addUserToGroup, removeUserFromGroup, 
  getGroupFromOrgAndSlug, getGroupMembership, updateGroupMembershipRole
} from "@/lib/db/auth";

import { clerkClient } from "@clerk/nextjs/server";
import { getCachedAuth } from "../lib/session";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { groupRoles } from "@/lib/roles";
import { Group } from "@prisma/client";
import { getOrCreateUserFromClerkId, isCurrentUserGroupOrOrgAdmin, validateGroupMembership } from "@/lib/helpers/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Group Actions

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

export async function updateGroupAction(groupId: string, name: string, slug: string, logo?: File | null) {
  const { orgId } = await getCachedAuth();
  
  // Check if user is an admin (either org admin or group admin)
  const canUpdateGroup = await isCurrentUserGroupOrOrgAdmin(groupId);
  
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
    let logoUrl: string | null | undefined; // undefined means don't update
    if (logo) {
      // User uploaded a new logo if it's not empty
      logoUrl = logo.size > 0 ? await putLogo(logo) : null;
    } else {
      logoUrl = logo; // logo===undefined means don't update
    }

    // Update the group
    const updateData: { name: string; slug: string; logoUrl?: string | null } = {
      name: name.trim(),
      slug: slug.trim(),
      logoUrl: logoUrl
    };

    const updatedGroup = await updateGroup(groupId, updateData);
    
    return { success: true, group: updatedGroup };
  } catch (error) {
    console.error("Failed to update group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update group");
  }
}

export async function deleteGroupAction(groupId: string) {
  // Check if user is an admin (either org admin or group admin)
  const isAdmin = await isCurrentUserGroupOrOrgAdmin(groupId);
  
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

export async function leaveGroupAction(groupId: string) {
  const { userId } = await getCachedAuth();
  
  try {
    await validateGroupMembership(groupId);

    await removeUserFromGroup(groupId, userId!);
    return { success: true };
  } catch (error) {
    console.error("Failed to leave group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to leave group");
  }
}

export async function addUserToGroupAction(groupId: string, userId: string, role: string) {
  // Check if user is an admin (either org admin or group admin)
  const isAdmin = await isCurrentUserGroupOrOrgAdmin(groupId);
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  try {
    // Check if user is already a member
    const existingMembership = await getGroupMembership(groupId, userId);
    if (existingMembership) {
      throw new Error("User is already a member of this group");
    }

    // Ensure user exists in our database
    await getOrCreateUserFromClerkId(userId);

    // Add user to group as a member
    await addUserToGroup(groupId, userId, role);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to add user to group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to add user to group");
  }
}

export async function removeUserFromGroupAction(groupId: string, userId: string) {
  const isAdmin = await isCurrentUserGroupOrOrgAdmin(groupId);
  if (!isAdmin) {
    throw new Error("Forbidden - Admin role required");
  }

  try {
    await removeUserFromGroup(groupId, userId);

    return { success: true };
  } catch (error) {
    console.error("Failed to remove user from group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to remove user from group");
  }
}

export async function updateGroupMembershipRoleAction(groupId: string, userId: string, newRole: string) {
  const isAdmin = await isCurrentUserGroupOrOrgAdmin(groupId);
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
  try {
    const groupJsonStr = JSON.stringify(group);

    // Store current group in cookies
    const cookieStore = await cookies();
    cookieStore.set('currentGroup', groupJsonStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to set current group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to set current group");
  }
}

export async function clearCurrentGroupAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('currentGroup');
    return { success: true };
  } catch (error) {
    console.error("Failed to clear current group:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to clear current group");
  }
}
