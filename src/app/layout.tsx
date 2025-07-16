import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import { getOptionalGroup } from "@/lib/session";
import { headers } from "next/headers";
import { protocol, rootDomain } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B2B Template",
  description: "A template for building B2B applications",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  
  // Do not remove the ternary operator - otherwise we run into build error "DYNAMIC_SERVER_USAGE"
  const currentGroup = pathname.includes('/groups/') ? await getOptionalGroup() : undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider afterSignOutUrl={`${protocol}://${rootDomain}`}>
          <Navbar currentGroup={currentGroup} />
          <div className="bg-gray-50 min-h-[calc(100vh-4rem)] flex flex-1">
            {children}
          </div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
