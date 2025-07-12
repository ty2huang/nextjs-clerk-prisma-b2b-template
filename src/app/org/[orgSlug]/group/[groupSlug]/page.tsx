import { redirect } from "next/navigation";

interface GroupPageProps {
  params: Promise<{ orgSlug: string; groupSlug: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { orgSlug, groupSlug } = await params;
  redirect(`/org/${orgSlug}/group/${groupSlug}/posts`);
}
