"use server";

import { getCachedAuth, getCurrentGroup } from "@/lib/clerk";
import { validateGroupMembershipAction } from "@/actions/auth";
import { createPost, deletePost, getAllPostsFromOrg, getPost, getPostsFromGroup } from "@/lib/db/post";

export const getAllPostsFromOrgAction = async () => {
  const { orgId } = await getCachedAuth();
  return await getAllPostsFromOrg(orgId!);
}

export async function createPostAction(title: string, content: string) {
  const group = await getCurrentGroup();
  await validateGroupMembershipAction(group.id);

  const post = await createPost(title, content, group.id);
  return post;
}

export async function deletePostAction(postId: string) {
  const group = await getCurrentGroup();
  await validateGroupMembershipAction(group.id);

  const post = await getPost(postId);
  if (!post) {
    throw new Error("Post not found");
  }
  if (post.groupId !== group.id) {
    throw new Error("You are not allowed to delete this post");
  }
  await deletePost(postId);
}
