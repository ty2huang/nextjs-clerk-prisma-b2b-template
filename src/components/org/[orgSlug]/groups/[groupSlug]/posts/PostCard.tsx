"use client";

import { deletePostAction } from "@/actions/posts";
import { PostWithGroup } from "@/lib/db/post";
import { useState } from "react";
import { toast } from "sonner";

interface PostCardProps {
  post: PostWithGroup;
  canDelete: boolean;
}

export default function PostCard({ post, canDelete }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePostAction(post.id);

      toast.success("Post deleted successfully!");
      // Reload the page to refresh the posts list
      location.reload();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 border border-zinc-800 rounded mt-4 bg-gray-100">
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-bold text-lg text-gray-900">
          {post.title}
        </h2>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white px-3 py-1 text-sm text-red-600 hover:text-red-800 
                       border border-red-300 hover:border-red-500 rounded
                       transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-3 space-y-1">
        <div>
          Author Group: <span className="underline">{post.group.name}</span>
        </div>
        <div>
          Posted: <span className="underline">{formatDate(post.createdAt.toISOString())}</span>
        </div>
      </div>
      
      {post.content && (
        <p className="mt-2 text-gray-800 leading-relaxed">
          {post.content}
        </p>
      )}
    </div>
  );
} 