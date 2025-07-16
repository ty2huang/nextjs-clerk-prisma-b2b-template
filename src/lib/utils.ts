export const rootDomain =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost:3000';

export const protocol =
  ["localhost", "127.0.0.1"].some(domain => rootDomain.includes(domain)) ? 'http' : 'https';

export function getFullDomain(subdomain?: string) {
  if (subdomain) {
    return `${subdomain}.${rootDomain}`;
  }
  return rootDomain;
}
