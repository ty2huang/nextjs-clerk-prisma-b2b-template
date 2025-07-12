import { getGroupMembersAction, isSessionUserGroupOrOrgAdmin } from "@/actions/auth";
import { notFound } from "next/navigation";
import MembersPageClient from "./client-page";
import { getCachedAuth, getCurrentGroup } from "@/lib/clerk";

export default async function MembersPage() {
  try {
    const { userId } = await getCachedAuth();
    const group = await getCurrentGroup();

    const [members, isAdmin] = await Promise.all([
      getGroupMembersAction(group.id),
      isSessionUserGroupOrOrgAdmin(group.id).catch(() => false), // If it fails, user is not admin
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
