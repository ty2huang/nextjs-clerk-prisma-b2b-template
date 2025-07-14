import { redirect } from "next/navigation";

interface GroupPageProps {
  params: Promise<{ groupSlug: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupSlug } = await params;
  redirect(`/app/groups/${groupSlug}/posts`);
}
