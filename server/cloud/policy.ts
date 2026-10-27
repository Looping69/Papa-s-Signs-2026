export function isTrustedManagement(host: string, origin: string | undefined, site: string | undefined, hosts: string[]) {
  return hosts.includes(host) && (!origin || origin === `https://${host}`) && site !== 'cross-site';
}
