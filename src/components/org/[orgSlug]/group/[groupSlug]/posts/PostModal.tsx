"use client";

import { useState } from "react";
import PostInputs from "./PostInputs";
import { X } from "lucide-react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ isOpen, onClose }: PostModalProps) {
  if (!isOpen) return null;

  const handlePostCreated = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
    >
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl border border-zinc-800">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Post
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-0">
            <PostInputs onPostCreated={handlePostCreated} />
          </div>
        </div>
      </div>
    </div>
  );
} 