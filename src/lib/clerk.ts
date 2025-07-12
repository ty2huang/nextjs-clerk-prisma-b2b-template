import { auth, currentUser } from "@clerk/nextjs/server";
import { Group } from "@prisma/client";
import { cache } from "react";

export const getCachedAuth = cache(async () => {
  const authResult = await auth();
  const isAdmin = authResult.has({ role: "org:admin" });
  return { ...authResult, isAdmin };
}); 

export const getOptionalGroup = cache(async () => {
  const user = await currentUser();
  return user?.publicMetadata.currentGroup as Group | undefined;
});

export const getCurrentGroup = cache(async () => {
  const group = await getOptionalGroup();
  if (!group) {
    throw new Error("No group selected for current user");
  }
  return group;
});
