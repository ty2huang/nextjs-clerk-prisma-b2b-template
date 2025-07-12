import LeftPanel from '@/components/org/[orgSlug]/group/[groupSlug]/LeftPanel';
import { getGroupFromSlugAction, setCurrentGroupAction } from '@/actions/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getOptionalGroup } from '@/lib/clerk';

interface GroupLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; groupSlug: string }>;
}

export default async function GroupLayout({ children, params }: GroupLayoutProps) {
  const { orgSlug, groupSlug } = await params;

  const group = await getGroupFromSlugAction(groupSlug);
  if (!group) {
    redirect(`/org/${orgSlug}`);
  }

  const currentGroup = await getOptionalGroup();
  if (!currentGroup || currentGroup.id !== group.id) {
    await setCurrentGroupAction(group);
    revalidatePath(`/org/${orgSlug}/group/${groupSlug}`);
  }

  return (
    <>
      <div className="flex flex-1">
        <LeftPanel />

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </>
  );
}
