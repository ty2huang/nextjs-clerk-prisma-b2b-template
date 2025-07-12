"use server";

import { getCurrentGroup } from "@/lib/session";
import { validateGroupMembership } from "@/lib/helpers/auth";
import { createPost, deletePost, getPost } from "@/lib/db/post";

export async function createPostAction(title: string, content: string) {
  const group = await getCurrentGroup();
  await validateGroupMembership(group.id);

  const post = await createPost(title, content, group.id);
  return post;
}

export async function deletePostAction(postId: string) {
  const group = await getCurrentGroup();
  await validateGroupMembership(group.id);

  const post = await getPost(postId);
  if (!post) {
    throw new Error("Post not found");
  }
  if (post.groupId !== group.id) {
    throw new Error("You are not allowed to delete this post");
  }
  await deletePost(postId);
}
