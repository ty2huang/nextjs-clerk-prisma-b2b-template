"use client";

import { createPostAction } from "@/actions/posts";
import { useState } from "react";
import { toast } from "sonner";

interface PostInputsProps {
  onPostCreated?: () => void;
}

export default function PostInputs({ onPostCreated }: PostInputsProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await createPostAction(title, content);

      setTitle("");
      setContent("");
      toast.success("Post created successfully!");
      
      // Call the callback if provided (for modal closing)
      if (onPostCreated) {
        onPostCreated();
      }
      
      location.reload();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    }
  }

  return (
    <div className="p-6">
      <form onSubmit={createPost} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter your post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       bg-white text-gray-900
                       placeholder-gray-500
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 ease-in-out
                       hover:border-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       bg-white text-gray-900
                       placeholder-gray-500
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 ease-in-out
                       hover:border-gray-400
                       resize-vertical"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 
                     text-white font-semibold rounded-lg
                     transition-all duration-200 ease-in-out
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     active:scale-98 transform
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-md hover:shadow-lg"
        >
          Create Post
        </button>
      </form>
    </div>
  );
}