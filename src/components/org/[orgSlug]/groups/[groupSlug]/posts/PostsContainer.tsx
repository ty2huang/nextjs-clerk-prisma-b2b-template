"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import PostModal from "./PostModal";
import { PostWithGroup } from "@/lib/db/post";
import { Plus } from "lucide-react";

interface PostsContainerProps {
  allPosts: PostWithGroup[];
  isDirectMember: boolean;
  currentGroupId: string;
}

export default function PostsContainer({ allPosts, isDirectMember, currentGroupId }: PostsContainerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'group'>('all');

  // Filter allPosts to get only posts from the current group
  const postsFromGroupWithGroup: PostWithGroup[] = allPosts.filter(post => post.groupId === currentGroupId);

  const displayPosts = activeTab === 'all' ? allPosts : postsFromGroupWithGroup;

  return (
    <>
      <div className="mt-8">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!isDirectMember}
          style={!isDirectMember ? { cursor: 'not-allowed' } : {}}
          className={`w-full py-3 px-6 font-semibold rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2
                     ${isDirectMember 
                       ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-98 transform' 
                       : 'bg-gray-300 text-gray-500'
                     }`}
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Posts
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {allPosts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'group'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Group Posts
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {postsFromGroupWithGroup.length}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-8">
        {displayPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {activeTab === 'all' 
              ? "No posts yet in this organization. Be the first to create one!"
              : "No posts yet in this group. Be the first to create one!"
            }
          </div>
        ) : (
          displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              canDelete={activeTab === 'group' && isDirectMember}
            />
          ))
        )}
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 