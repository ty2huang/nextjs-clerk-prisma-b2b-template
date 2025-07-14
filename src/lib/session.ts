import { auth } from "@clerk/nextjs/server";
import { Group } from "@prisma/client";
import { cache } from "react";
import { cookies } from "next/headers";

export const getCachedAuth = cache(async () => {
  const authResult = await auth();
  const isAdmin = authResult.has({ role: "org:admin" });
  return { ...authResult, isAdmin };
}); 

export async function getOptionalGroup() {
  try {
    const cookieStore = await cookies();
    const groupCookie = cookieStore.get('currentGroup');
    
    if (!groupCookie?.value) {
      return undefined;
    }

    return JSON.parse(groupCookie.value) as Group;
  } catch (error) {
    console.error("Failed to parse current group from cookies:", error);
    return undefined;
  }
};

export async function getCurrentGroup() {
  const group = await getOptionalGroup();
  if (!group) {
    throw new Error("No group selected for current user");
  }
  return group;
};
