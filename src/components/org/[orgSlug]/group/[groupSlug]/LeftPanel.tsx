"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ChevronLeft, FileText, Users, Settings } from "lucide-react";

export default function LeftPanel() {
  const pathname = usePathname();
  const { orgSlug, groupSlug } = useParams<{ orgSlug: string; groupSlug: string }>();

  const baseUrl = `/org/${orgSlug}/group/${groupSlug}`;
  
  const isPostsActive = pathname.startsWith(`${baseUrl}/posts`);
  const isMembersActive = pathname.startsWith(`${baseUrl}/members`);
  const isSettingsActive = pathname.startsWith(`${baseUrl}/settings`);

  return (
    <div className="w-48 bg-white border-r border-gray-200 space-y-6">
      <Link 
        href={`/org/${orgSlug}`} 
        className="flex items-center px-4 py-3 text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to groups
      </Link>
      <nav className="">
        <div className="px-3 py-2 text-xs text-gray-500">Content</div>
        <Link
          href={`${baseUrl}/posts`}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
            isPostsActive
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Posts
        </Link>
      </nav>
      <nav className="">
        <div className="px-3 py-2 text-xs text-gray-500">Group Management</div>
        <Link
          href={`${baseUrl}/members`}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
            isMembersActive
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Members
        </Link>
        <Link
          href={`${baseUrl}/settings`}
          className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
            isSettingsActive
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Link>
      </nav>
    </div>
  );
}