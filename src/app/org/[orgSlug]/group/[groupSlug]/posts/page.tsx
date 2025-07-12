import { isGroupMember } from "@/actions/auth";
import { getAllPostsFromOrgAction } from "@/actions/posts";
import PostsContainer from "@/components/org/[orgSlug]/group/[groupSlug]/posts/PostsContainer";
import { getCurrentGroup } from "@/lib/clerk";
import { notFound } from "next/navigation";

export default async function PostsPage() {
  try {
    const group = await getCurrentGroup();
    const allPosts = await getAllPostsFromOrgAction();
    const isDirectMember = await isGroupMember(group.id);

    return (
      <div className="max-w-2xl mx-auto p-4">
        <PostsContainer 
          allPosts={allPosts}
          isDirectMember={isDirectMember}
          currentGroupId={group.id}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}