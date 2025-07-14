"use client";

import Link from "next/link";
import { Group } from "@prisma/client";
import { Users, ArrowRight } from "lucide-react";
import { setCurrentGroupAction } from "@/actions/auth";
import Image from "next/image";

interface GroupCardProps {
  group: Group;
  showViewGroupLink?: boolean;
}

export default function GroupCard({ group, showViewGroupLink = true }: GroupCardProps) {
  const handleGroupClick = async () => {
    if (showViewGroupLink) {
      // Set the current group context before navigation
      try {
        await setCurrentGroupAction(group);
      } catch (error) {
        console.error("Failed to set group context:", error);
        // Continue with navigation even if setting context fails
      }
    }
  };
  
  const cardContent = (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 transition-all h-48 flex flex-col ${
      showViewGroupLink 
        ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer' 
        : 'cursor-default'
    }`}>
      <div className="flex-1">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
          {group.logoUrl ? (
            <Image 
              src={group.logoUrl} 
              width={48}
              height={48}
              alt={`${group.name} logo`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {group.name}
        </h3>
        <p className="text-gray-600 text-sm">
          Slug: {group.slug}
        </p>
      </div>
      {showViewGroupLink && (
        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
          <span>View Group</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );

  if (showViewGroupLink) {
    return (
      <Link href={`/app/groups/${group.slug}`} onClick={handleGroupClick}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
} 