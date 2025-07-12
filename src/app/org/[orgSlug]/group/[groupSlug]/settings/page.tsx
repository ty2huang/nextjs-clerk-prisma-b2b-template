import { redirect } from "next/navigation";
import { isSessionUserGroupOrOrgAdmin } from "@/actions/auth";
import { getGroupMembership } from "@/lib/db/auth";
import { getCachedAuth, getCurrentGroup } from "@/lib/clerk";
import GroupSettingsClient from "./client-page";

interface GroupSettingsPageProps {
  params: Promise<{ orgSlug: string; groupSlug: string }>;
}

export default async function GroupSettingsPage({ params }: GroupSettingsPageProps) {
  const { orgSlug } = await params;
  
  try {
    // Get group data
    const group = await getCurrentGroup();

    // Get user permissions and membership
    const { userId } = await getCachedAuth();
    const [isGroupAdmin, directMembership] = await Promise.all([
      isSessionUserGroupOrOrgAdmin(group.id),
      getGroupMembership(userId!, group.id)
    ]);

    // User is a direct member if they have a membership record
    const isDirectMember = !!directMembership;

    return (
      <GroupSettingsClient
        group={group}
        isUserAdmin={isGroupAdmin}
        isDirectMember={isDirectMember}
        orgSlug={orgSlug}
      />
    );
  } catch (error) {
    console.error("Error loading group settings:", error);
    redirect(`/org/${orgSlug}`);
  }
}
