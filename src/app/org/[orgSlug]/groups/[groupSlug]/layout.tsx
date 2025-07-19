import LeftPanel from '@/components/org/[orgSlug]/groups/[groupSlug]/LeftPanel';
import { notFound } from 'next/navigation';
import { getCachedAuth, getOptionalGroup } from '@/lib/session';
import GroupValidator from '@/components/org/[orgSlug]/groups/[groupSlug]/GroupValidator';
import { getGroupFromOrgAndSlug, getGroupMembership } from '@/lib/db/auth';

const getGroupFromSlug = async (slug: string) => {
  const { orgId } = await getCachedAuth();
  const group = await getGroupFromOrgAndSlug(orgId!, slug);
  return group;
}

interface GroupLayoutProps {
  children: React.ReactNode;
  params: Promise<{ groupSlug: string }>;
}

export default async function GroupLayout({ children, params }: GroupLayoutProps) {
  const { groupSlug } = await params;
  const { userId, isAdmin } = await getCachedAuth();

  const group = await getGroupFromSlug(groupSlug);
  if (!group) {
    notFound();
  }

  const currentGroup = await getOptionalGroup();

  // If the user is not a member of the current group, redirect to the groups page
  if (currentGroup && !isAdmin) {
    const membership = await getGroupMembership(currentGroup.id, userId!);
    if (!membership) {
      notFound();
    }
  }

  return (
    <>
      <div className="flex flex-1">
        <GroupValidator currentGroupId={currentGroup?.id} urlGroup={group} />
        <LeftPanel />

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </>
  );
}
