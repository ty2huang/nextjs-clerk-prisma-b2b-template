import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { rootDomain } from '@/lib/utils';

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  const rootDomainFormatted = rootDomain.split(':')[0];

  const isSubdomain = 
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/api/(.*)"]);

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname: requestPath } = req.nextUrl;
  
  // Handle subdomain routing BEFORE Clerk processes the request
  const subdomain = extractSubdomain(req);
  let modifiedRequest = req;
  
  if (subdomain && requestPath.startsWith("/app")) {
    // Rewrite to organization route so Clerk's organizationSyncOptions can work
    const suffix = requestPath === "/app" ? "" : requestPath.replace("/app/", "/");
    const newPath = `/org/${subdomain}${suffix}`;
    
    // Create a new URL with the rewritten path
    const url = req.nextUrl.clone();
    url.pathname = newPath;
    
    // Create a new request with the rewritten URL
    modifiedRequest = new NextRequest(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.body
    });
  }

  // Now call Clerk middleware with the potentially rewritten request
  return clerkMiddleware(async (auth, clerkReq) => {
    // Add authentication protection for all routes except public ones
    if (!isPublicRoute(clerkReq)) {
      await auth.protect();
    }

    // Create the response with appropriate headers
    let response: NextResponse;
    
    if (subdomain && requestPath.startsWith("/app")) {
      // For subdomain requests, we need to rewrite the response
      response = NextResponse.rewrite(clerkReq.url);
      console.log("rewriting to destination path:", clerkReq.nextUrl.pathname);
    } else {
      response = NextResponse.next();
    }
    
    response.headers.set('x-subdomain', subdomain || "");
    response.headers.set('x-pathname', requestPath);
    return response;
  }, {
    // Use Clerk's built-in organization synchronization
    organizationSyncOptions: {
      organizationPatterns: ['/org/:slug', '/org/:slug/(.*)']
    }
  })(modifiedRequest, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};