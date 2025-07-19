"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getOrganizationMembersAction, addUserToGroupAction, removeUserFromGroupAction, updateGroupMembershipRoleAction 
} from "@/actions/auth";
import { MembershipWithUser } from "@/lib/db/auth";
import { Trash, Plus, ChevronDown, Check } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useConfirm } from "@/components/ConfirmDialog";
import { groupRoles } from "@/lib/roles";
import { User } from "@prisma/client";
import { toast } from "sonner";

interface MembersPageClientProps {
  groupId: string;
  members: MembershipWithUser[];
  isAdmin: boolean;
  sessionUserId: string;
}

export default function MembersPageClient({ groupId, members, isAdmin, sessionUserId }: MembersPageClientProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  
  const membersSorted = useMemo(() => members.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  }), [members]);

  const [searchInput, setSearchInput] = useState("");
  const [orgMembers, setOrgMembers] = useState<User[]>([]);
  const [isLoadingOrgMembers, setIsLoadingOrgMembers] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchContainerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Handle search suggestions dropdown
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
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
        toast.error("Failed to add user to group");
      }
    });
  };

  // Handle remove member confirmation
  const handleRemoveMember = async (member: MembershipWithUser) => {
    const confirmed = await confirm({
      title: "Remove Member",
      message: `Are you sure you want to remove ${member.user.name || member.user.email} from this group? They will lose access to all group content.`,
      confirmText: "Remove Member",
      cancelText: "Cancel",
      confirmButtonClass: "bg-red-600 hover:bg-red-700"
    });

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await removeUserFromGroupAction(groupId, member.user.clerkId);
        // Refresh the page data to show the updated member list
        router.refresh();
        toast.success("Member removed successfully");
      } catch (error) {
        console.error("Failed to remove user from group:", error);
        toast.error("Failed to remove user from group");
      }
    });
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
        toast.error("Failed to update user role");
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
                          placeholder="Add groups members by searching the name or email here"
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
                              No users found. The user must be a member of this organization first.
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
                      <Listbox
                        value={member.role}
                        onChange={(newRole) => handleRoleChange(member.user.clerkId, newRole)}
                        disabled={isPending}
                      >
                        <div className="relative">
                          <ListboxButton className="relative w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex items-center justify-between">
                            <span className="block truncate">
                              {groupRoles.find(role => role.name === member.role)?.label || toTitleCase(member.role)}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
                          </ListboxButton>

                          <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 focus:outline-none">
                            {groupRoles.map((role) => (
                              <ListboxOption
                                key={role.name}
                                value={role.name}
                                className="relative cursor-default select-none py-2.5 px-4 text-sm text-gray-900 data-[focus]:bg-gray-50 data-[selected]:bg-blue-50 data-[selected]:text-blue-700"
                              >
                                {({ selected }) => (
                                  <div className="flex items-center justify-between">
                                    <span className="block truncate">{role.label}</span>
                                    {selected && <Check className="h-4 w-4 text-blue-600" />}
                                  </div>
                                )}
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </div>
                      </Listbox>
                    ) : (
                      <span className="inline-flex px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
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
                        title={member.user.clerkId === sessionUserId ? "Go to Settings to leave group" : "Remove member"}
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
    </div>
  );
} 