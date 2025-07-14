"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GroupModal from "@/components/org/[orgSlug]/groups/GroupModal";
import GroupCard from "@/components/org/[orgSlug]/groups/GroupCard";
import { Group } from "@prisma/client";
import { Users, Plus } from "lucide-react";
import { clearCurrentGroupAction } from "@/actions/auth";

interface OrgPageClientProps {
  allGroups: Group[];
  userGroups: Group[];
  isAdmin: boolean;
}

export default function OrgPageClient({ allGroups, userGroups, isAdmin }: OrgPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'your' | 'all'>('your');
  const router = useRouter();

  useEffect(() => {
    clearCurrentGroupAction();
  }, []);

  return (
    <div className="w-6xl mx-auto p-6">
      {/* Main Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Groups
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('your')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'your'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Your Groups
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {userGroups.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Groups
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {allGroups.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'your' && (
          <div>
            {userGroups.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No groups yet
                </h3>
                <p className="text-gray-500">
                  You are not a member of any group in this organization. {isAdmin ? "" : "Ask an admin to add you to one."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userGroups.map(group => (
                  <div key={group.id} className="group">
                    <GroupCard 
                      group={group}
                      showViewGroupLink={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            {isAdmin && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Manage groups as an organization admin.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create Group Card */}
              {isAdmin && (
                <div className="group">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                  >
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer h-48 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Create Group
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add a new group to your organization
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* All Group Cards */}
              {allGroups.map(group => (
                <div key={group.id} className="group">
                  <GroupCard 
                    group={group}
                    showViewGroupLink={isAdmin}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Group Modal */}
      <GroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={() => {
          setIsModalOpen(false);
          // Keep the user on the All Groups tab after creating a group
          setActiveTab('all');
          // Refresh the page data to show the new group
          router.refresh();
        }}
      />
    </div>
  );
} 