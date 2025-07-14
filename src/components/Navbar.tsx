"use client";

import {
  OrganizationSwitcher,
  UserButton,
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { Group } from "@prisma/client";
import Image from "next/image";
import { protocol, rootDomain } from "@/lib/utils";

const Navbar = ({ currentGroup }: { currentGroup: Group | undefined }) => {
  const pathname = usePathname();
  
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {pathname.startsWith("/app/") && (
          <SignedIn>
            <Link href="/app" className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-md transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <span className="text-gray-400 text-xl">/</span>
            <OrganizationSwitcher 
              hidePersonal={true}
              afterSelectOrganizationUrl={`${protocol}://:slug.${rootDomain}/app`}
              afterCreateOrganizationUrl={`${protocol}://:slug.${rootDomain}/app`}
              afterLeaveOrganizationUrl={`${protocol}://${rootDomain}`}
              appearance={{
                elements: {
                  organizationPreview: {
                    gap: "0.5rem"
                  },
                  organizationSwitcherTrigger: {
                    paddingRight: "0"
                  },
                  organizationPreviewMainIdentifier: {
                    fontSize: "var(--text-sm)",
                    color: "var(--color-gray-600)"
                  },
                }
              }}
            />
            {pathname.includes('/groups/') && currentGroup && (
              <>
                <span className="text-gray-400 text-xl">/</span>
                <div className="flex items-center gap-2 pl-2">
                  {currentGroup.logoUrl ? (
                    <Image 
                      src={currentGroup.logoUrl} 
                      width={20}
                      height={20}
                      alt={`${currentGroup.name} logo`}
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {currentGroup.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-600 text-sm font-normal">{currentGroup.name}</span>
                </div>
              </>
            )}
          </SignedIn>
        )}
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button>
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar; 