import { Group, GroupMembership, User } from "@prisma/client";
import prisma from "../prisma";

// Organization Queries

export async function createOrg(clerkOrgId: string, name: string, slug: string) {
  const org = await prisma.organization.create({
    data: { clerkId: clerkOrgId, name, slug },
  });
  return org;
}

export async function getOrgFromId(clerkOrgId: string) {
  const org = await prisma.organization.findUnique({
    where: { clerkId: clerkOrgId },
  });
  return org;
}

// User Queries

export async function createUser(clerkUserId: string, name: string, email: string) {
  const user = await prisma.user.create({
    data: { clerkId: clerkUserId, name, email },
  });
  return user;
}

export async function getUserFromId(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });
  return user;
}

// Group Queries

export async function getGroupFromOrgAndSlug(orgId: string, slug: string) {
  const group = await prisma.group.findFirst({
    where: { orgId, slug },
  });
  return group;
}

export async function createGroup(orgId: string, name: string, slug: string, logoUrl?: string | null) {
  const group = await prisma.group.create({
    data: { orgId, name, slug, logoUrl },
  });

  return group;
}

export async function listAllGroupsForOrg(orgId: string) {
  const groups = await prisma.group.findMany({
    where: { orgId },
  });
  return groups;
}

export async function listUserGroupsForOrg(userId: string, orgId: string) {
  const memberships = await prisma.groupMembership.findMany({
    where: { group: { orgId }, userId },
    select: { 
      group: true
    },
  });
  
  return memberships.map(membership => membership.group);
}

export async function updateGroup(groupId: string, data: { name?: string; slug?: string; logoUrl?: string | null }) {
  const group = await prisma.group.update({
    where: { id: groupId },
    data,
  });
  return group;
}

export async function deleteGroup(groupId: string) {
  // This will cascade delete all related memberships and content
  await prisma.group.delete({
    where: { id: groupId },
  });
}

export type MembershipWithUser = GroupMembership & {
  user: User;
}

export type GroupWithMemberships = Group & {
  memberships: MembershipWithUser[];
}

export async function getGroupWithMemberships(groupId: string): Promise<GroupWithMemberships | null> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
    },
  });
  return group;
}

// Membership Queries

export async function addUserToGroup(groupId: string, userId: string, role: string) {
  const groupMembership = await prisma.groupMembership.create({
    data: { userId, groupId, role },
  });
  return groupMembership;
}

export async function getGroupMembership(groupId: string, userId: string) {
  const membership = await prisma.groupMembership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  return membership;
}

export async function removeUserFromGroup(groupId: string, userId: string) {
  await prisma.groupMembership.delete({
    where: { userId_groupId: { userId, groupId } },
  });
}

export async function updateGroupMembershipRole(groupId: string, userId: string, role: string) {
  const membership = await prisma.groupMembership.update({
    where: { userId_groupId: { userId, groupId } },
    data: { role },
  });
  return membership;
}
