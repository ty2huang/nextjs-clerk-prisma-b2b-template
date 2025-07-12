import prisma from "@/lib/prisma";
import { Group, Post } from "@prisma/client";

export async function createPost(title: string, content: string, groupId: string) {
  return await prisma.post.create({
    data: {
      title,
      content,
      groupId,
    },
  });
}

export type PostWithGroup = Post & { group: Group };

export async function getAllPostsFromOrg(orgId: string): Promise<PostWithGroup[]> {
  return await prisma.post.findMany({
    where: { group: { orgId } },
    include: {
      group: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostsFromGroup(groupId: string): Promise<Post[]> {
  return await prisma.post.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPost(postId: string): Promise<Post | null> {
  return await prisma.post.findUnique({
    where: { id: postId },
  });
}

export async function deletePost(postId: string) {
  return await prisma.post.delete({
    where: { id: postId },
  });
}