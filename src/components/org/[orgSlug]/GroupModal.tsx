"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createGroupAction } from "@/actions/auth";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function GroupModal({ isOpen, onClose, onGroupCreated }: GroupModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error("File size must be less than 10MB");
        return;
      }
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Generate slug: lowercase, replace spaces with hyphens, remove special chars
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createGroupAction(name, slug, logo);

      if (result.success) {
        toast.success("Group created successfully!");
        setName("");
        setSlug("");
        setLogo(null);
        setLogoPreview(null);
        onClose();
        
        if (onGroupCreated) {
          onGroupCreated();
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-gray-900">
                Create group
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-100 transition-colors">
                    {logoPreview ? (
                      <Image src={logoPreview} width={64} height={64} alt="Logo preview" className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <Upload className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </label>
                <div>
                  <label htmlFor="logo-upload" className="cursor-pointer rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Upload
                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/*" disabled={isLoading} />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    Recommended size 1:1, up to 10MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Group name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                          bg-white text-gray-900 placeholder-gray-500 text-sm
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200"
                required
                disabled={isLoading}
              />
            </div>

            {/* Slug field */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                placeholder="my-group"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                          bg-white text-gray-900 placeholder-gray-500 text-sm
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200"
                required
                disabled={isLoading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !name.trim() || !slug.trim()}
                className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 
                          text-white font-medium rounded-md
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                          focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {isLoading ? "Creating group..." : "Create group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 