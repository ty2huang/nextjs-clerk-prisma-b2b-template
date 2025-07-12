import LeftPanel from '@/components/org/[orgSlug]/group/[groupSlug]/LeftPanel';
import { redirect } from 'next/navigation';
import { getCachedAuth, getOptionalGroup } from '@/lib/session';
import GroupValidator from '@/components/org/[orgSlug]/group/[groupSlug]/GroupValidator';
import { getGroupFromOrgAndSlug } from '@/lib/db/auth';

const getGroupFromSlug = async (slug: string) => {
  const { orgId } = await getCachedAuth();
  const group = await getGroupFromOrgAndSlug(orgId!, slug);
  return group;
}

interface GroupLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; groupSlug: string }>;
}

export default async function GroupLayout({ children, params }: GroupLayoutProps) {
  const { orgSlug, groupSlug } = await params;

  const group = await getGroupFromSlug(groupSlug);
  if (!group) {
    redirect(`/org/${orgSlug}`);
  }

  const currentGroup = await getOptionalGroup();

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
