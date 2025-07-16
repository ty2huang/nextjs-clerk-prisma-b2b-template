export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export const protocol =
  ["localhost", "127.0.0.1"].some(domain => rootDomain.includes(domain)) ? 'http' : 'https';

export function getFullDomain(subdomain?: string) {
  if (subdomain) {
    return `${subdomain}.${rootDomain}`;
  }
  return rootDomain;
}
