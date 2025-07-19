"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  updateGroupAction, 
  deleteGroupAction, 
  leaveGroupAction,
  setCurrentGroupAction
} from "@/actions/auth";
import { Upload, Edit, Trash2, LogOut, Save, X } from "lucide-react";
import { Group } from "@prisma/client";
import { useConfirm } from "@/components/ConfirmDialog";
import Image from "next/image";

interface GroupSettingsClientProps {
  group: Group;
  isUserAdmin: boolean;
  isDirectMember: boolean;
}

export default function GroupSettingsClient({
  group,
  isUserAdmin,
  isDirectMember
}: GroupSettingsClientProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(group.name);
  const [editSlug, setEditSlug] = useState(group.slug);
  const [editLogo, setEditLogo] = useState<File | null | undefined>(undefined); // undefined means keep existing logo

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditLogo(file);
    }
  };

  const handleClearLogo = () => {
    setEditLogo(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditName(group.name);
    setEditSlug(group.slug);
    setEditLogo(undefined);
  };

  const handleSaveChanges = async () => {
    if (!editName.trim() || !editSlug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await updateGroupAction(group.id, editName.trim(), editSlug.trim(), editLogo);

      if (result.success) {
        await setCurrentGroupAction(result.group);
        
        setIsEditing(false);
        setEditLogo(undefined);
        
        // If slug changed, redirect to new URL
        if (editSlug !== group.slug) {
          router.push(`/app/groups/${editSlug}/settings`);
        } else {
          // Refresh the page to load updated group data in all server components
          router.refresh();
        }
        toast.success("Group updated successfully");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = await confirm({
      title: "Delete Group",
      message: `Are you sure you want to delete "${group.name}"? This action cannot be undone and will PERMANENTLY delete all group content and member data.`,
      confirmText: "Delete Group",
      cancelText: "Cancel",
      confirmButtonClass: "bg-red-600 hover:bg-red-700"
    });

    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      
      const result = await deleteGroupAction(group.id);
      
      if (result.success) {
        toast.success("Group deleted successfully");
        router.push("/app/groups");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveGroup = async () => {
    const confirmed = await confirm({
      title: "Leave Group",
      message: `Are you sure you want to leave "${group.name}"? You will no longer have access to group content and will need to be re-invited to rejoin.`,
      confirmText: "Leave Group",
      cancelText: "Cancel",
      confirmButtonClass: "bg-red-600 hover:bg-red-700"
    });

    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      
      const result = await leaveGroupAction(group.id);
      
      if (result.success) {
        toast.success("Left group successfully");
        router.push("/app/groups");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Settings</h1>
          <p className="text-gray-600 mt-1">Manage your group information and settings</p>
        </div>
      </div>

      {/* Group Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Group Information</h2>
          {isUserAdmin && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Logo, Name, and Slug in one row */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div 
                  className={`w-14 h-14 rounded-lg overflow-hidden border border-gray-200 ${
                    isEditing ? 'cursor-pointer hover:border-gray-300' : ''
                  }`}
                  onClick={isEditing ? () => document.getElementById('logo-upload')?.click() : undefined}
                >
                  {isEditing ? (
                    editLogo ? (
                      <Image 
                        src={URL.createObjectURL(editLogo)} 
                        width={56}
                        height={56}
                        alt="Group logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      editLogo === null || group.logoUrl === null ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-black" />
                        </div>
                      ) : (
                        <Image 
                          src={group.logoUrl} 
                          width={56}
                          height={56}
                          alt="Group logo" 
                          className="w-full h-full object-cover"
                        />
                      )
                    )
                  ) : (
                    group.logoUrl ? (
                      <Image 
                        src={group.logoUrl} 
                        width={56}
                        height={56}
                        alt="Group logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-3xl">
                          {group.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )
                  )}
                </div>
                
                {/* Clear logo button */}
                {isEditing && (editLogo || group.logoUrl) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearLogo();
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                {/* Hidden file input */}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                )}
              </div>
            </div>

            {/* Name and Slug */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                ) : (
                  <p className="text-gray-900 text-md font-medium">{group.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Slug (For URLs)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="group-slug"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{group.slug}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
        
        <div className="space-y-4">
          {/* Leave Group - Only show if user is a direct member */}
          {isDirectMember && (
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Leave Group</h3>
                <p className="text-sm text-gray-600">
                  Remove yourself from this group. You won&apos;t be able to access group content.
                </p>
              </div>
              <button
                onClick={handleLeaveGroup}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Group
              </button>
            </div>
          )}

          {/* Delete Group */}
          {isUserAdmin && (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900">Delete Group</h3>
                <p className="text-sm text-red-600">
                  Permanently delete this group and all its content. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteGroup}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 