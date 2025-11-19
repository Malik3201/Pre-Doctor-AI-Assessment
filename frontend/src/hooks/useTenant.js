export default function useTenant() {
  if (typeof window === 'undefined') {
    return {
      host: '',
      subdomain: null,
      isRoot: true,
    };
  }

  const host = window.location.host || '';
  const [hostname] = host.split(':');
  const parts = hostname.split('.');

  if (parts.length <= 1) {
    return {
      host: hostname,
      subdomain: null,
      isRoot: true,
    };
  }

  const tld = parts.slice(-1)[0];
  const isLocalhost = tld === 'localhost';

  if (isLocalhost) {
    const subdomain = parts.slice(0, -1).join('.');
    return {
      host: hostname,
      subdomain: subdomain || null,
      isRoot: !subdomain,
    };
  }

  const subdomain = parts.slice(0, -2).join('.');
  return {
    host: hostname,
    subdomain: subdomain || null,
    isRoot: !subdomain,
  };
}

