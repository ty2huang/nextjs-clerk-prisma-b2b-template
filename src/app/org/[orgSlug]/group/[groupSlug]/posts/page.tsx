import PostsContainer from "@/components/org/[orgSlug]/group/[groupSlug]/posts/PostsContainer";
import { getCachedAuth, getOptionalGroup } from "@/lib/session";
import { getGroupMembership } from "@/lib/db/auth";
import { getAllPostsFromOrg } from "@/lib/db/post";
import { notFound } from "next/navigation";

export default async function PostsPage() {
  try {
    const group = await getOptionalGroup();
    if (!group) {
      return <></>
    }

    const { userId, orgId } = await getCachedAuth();
    const allPosts = await getAllPostsFromOrg(orgId!);
    const membership = await getGroupMembership(userId!, group.id);

    return (
      <div className="max-w-2xl mx-auto p-4">
        <PostsContainer 
          allPosts={allPosts}
          isDirectMember={!!membership}
          currentGroupId={group.id}
        />
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}