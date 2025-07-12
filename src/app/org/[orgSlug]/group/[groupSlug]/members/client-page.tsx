"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getOrganizationMembersAction, addUserToGroupAction, removeUserFromGroupAction, updateGroupMembershipRoleAction 
} from "@/actions/auth";
import { MembershipWithUser } from "@/lib/db/auth";
import { Trash, Plus } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { groupRoles } from "@/lib/roles";
import { User } from "@prisma/client";

interface MembersPageClientProps {
  groupId: string;
  members: MembershipWithUser[];
  isAdmin: boolean;
  sessionUserId: string;
}

export default function MembersPageClient({ groupId, members, isAdmin, sessionUserId }: MembersPageClientProps) {
  const router = useRouter();
  const membersSorted = useMemo(() => members.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  }), [members]);

  const [searchInput, setSearchInput] = useState("");
  const [orgMembers, setOrgMembers] = useState<User[]>([]);
  const [isLoadingOrgMembers, setIsLoadingOrgMembers] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Confirmation dialog state
  const [memberToRemove, setMemberToRemove] = useState<MembershipWithUser | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to capitalize first letter
  const toTitleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    // Ensure we're working with a proper Date object
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(dateObj);
  };

  // Load organization members when search input is not empty
  const handleSearchChange = async (value: string) => {
    setSearchInput(value);
    
    if (value.trim()) {
      setShowSuggestions(true);
      setIsLoadingOrgMembers(true);
      try {
        const members = await getOrganizationMembersAction();
        setOrgMembers(members);
      } catch (error) {
        console.error("Failed to load organization members:", error);
      } finally {
        setIsLoadingOrgMembers(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Filter organization members based on search input
  const filteredOrgMembers = orgMembers.filter(orgMember => {
    const searchTerm = searchInput.toLowerCase();
    const isAlreadyMember = membersSorted.some(member => member.user.email === orgMember.email);
    
    return !isAlreadyMember && (
      orgMember.name?.toLowerCase().includes(searchTerm) ||
      orgMember.email.toLowerCase().includes(searchTerm)
    );
  });

  // Add user to group
  const handleAddUser = (clerkUserId: string) => {
    startTransition(async () => {
      try {
        await addUserToGroupAction(groupId, clerkUserId, "member");
        // Clear search and refetch
        setSearchInput("");
        setShowSuggestions(false);
        // Refresh the page data to show the new member
        router.refresh();
      } catch (error) {
        console.error("Failed to add user to group:", error);
        alert("Failed to add user to group. Please try again.");
      }
    });
  };

  // Handle remove member confirmation
  const handleRemoveMember = (member: MembershipWithUser) => {
    setMemberToRemove(member);
  };

  // Handle role change
  const handleRoleChange = (clerkUserId: string, newRole: string) => {
    startTransition(async () => {
      try {
        await updateGroupMembershipRoleAction(groupId, clerkUserId, newRole);
        // Refresh the page data to show the updated role
        router.refresh();
      } catch (error) {
        console.error("Failed to update user role:", error);
        alert("Failed to update user role. Please try again.");
      }
    });
  };

  // Confirm remove member
  const confirmRemoveMember = () => {
    if (!memberToRemove) return;
    
    startTransition(async () => {
      try {
        await removeUserFromGroupAction(groupId, memberToRemove.user.clerkId);
        // Refresh the page data to show the updated member list
        router.refresh();
      } catch (error) {
        console.error("Failed to remove user from group:", error);
        alert("Failed to remove user from group. Please try again.");
      } finally {
        setMemberToRemove(null);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Members</h1>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Number of Members:</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
              {membersSorted.length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-blue-50 mb-8 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All organization admins can manage groups without being a direct member.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Admin add user row */}
              {isAdmin && (
                <tr className="bg-gray-100">
                  <td colSpan={4} className="px-6 py-4">
                    <div className="relative" ref={searchContainerRef}>
                      <div className="relative">
                        <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Add organization members as members of this group by typing their name or email here"
                          value={searchInput}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onFocus={() => searchInput.trim() && setShowSuggestions(true)}
                          className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoComplete="off"
                          disabled={isPending}
                        />
                      </div>
                      
                      {/* Dropdown with search results */}
                      {searchInput.trim() && showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[100] max-h-80 overflow-y-auto">
                          {isLoadingOrgMembers ? (
                            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                          ) : filteredOrgMembers.length > 0 ? (
                            filteredOrgMembers.map((orgMember) => (
                              <button
                                key={orgMember.clerkId}
                                onClick={() => handleAddUser(orgMember.clerkId)}
                                disabled={isPending}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 disabled:opacity-50"
                              >
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {orgMember.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {orgMember.email}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No users found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
              {/* Existing members */}
              {membersSorted.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                          </span>
                        </div>
                      </div> */}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.user.name || 'Unnamed User'}
                          {member.user.clerkId === sessionUserId && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-md border border-gray-300 bg-gray-100 text-gray-500">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isAdmin ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user.clerkId, e.target.value)}
                        disabled={isPending}
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 min-w-[120px]"
                      >
                        {groupRoles.map((role) => (
                          <option key={role.name} value={role.name}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {toTitleCase(member.role)}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => member.user.clerkId !== sessionUserId && handleRemoveMember(member)}
                        disabled={isPending || member.user.clerkId === sessionUserId}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:text-gray-400"
                        title={member.user.clerkId === sessionUserId ? "This is you! Go to Settings to leave group" : "Remove member"}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        isOpen={memberToRemove !== null}
        onClose={() => {
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove "${memberToRemove?.user.name || memberToRemove?.user.email}" from this group? They will lose access to all group content.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={isPending}
      />
    </div>
  );
} 