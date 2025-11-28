const DEFAULT_TENANT = {
  host: '',
  baseDomain: '',
  subdomain: null,
  isRoot: true,
};

const cloneDefaultTenant = () => ({ ...DEFAULT_TENANT });

const sanitizeHost = (rawHost = '') => {
  if (!rawHost) {
    return '';
  }
  const [hostWithoutPort] = rawHost.split(':');
  return hostWithoutPort.trim();
};

export const parseTenantFromHost = (rawHost = '') => {
  const host = sanitizeHost(rawHost);
  if (!host) {
    return cloneDefaultTenant();
  }

  const rawParts = host.split('.').filter(Boolean);
  if (!rawParts.length) {
    return cloneDefaultTenant();
  }

  const normalizedParts = rawParts.map((part) => part.toLowerCase());
  const normalizedHost = normalizedParts.join('.');

  // Localhost and *.localhost handling
  if (normalizedParts[normalizedParts.length - 1] === 'localhost') {
    const subdomain = rawParts.slice(0, -1).join('.') || null;
    return {
      host,
      baseDomain: 'localhost',
      subdomain,
      isRoot: !subdomain,
    };
  }

  // Handle *.project.vercel.app deployments (tenant.project.vercel.app)
  if (normalizedHost.endsWith('.vercel.app')) {
    const baseDomainParts = rawParts.slice(-3);
    const baseDomain = baseDomainParts.join('.');

    if (rawParts.length <= 3) {
      return {
        host,
        baseDomain,
        subdomain: null,
        isRoot: true,
      };
    }

    const subdomain = rawParts.slice(0, -3).join('.');
    return {
      host,
      baseDomain,
      subdomain,
      isRoot: !subdomain,
    };
  }

  // Standard domains (domain.tld) or multi-level subdomains
  if (rawParts.length <= 2) {
    return {
      host,
      baseDomain: rawParts.join('.'),
      subdomain: null,
      isRoot: true,
    };
  }

  const baseDomain = rawParts.slice(-2).join('.');
  const subdomain = rawParts.slice(0, -2).join('.');

  return {
    host,
    baseDomain,
    subdomain,
    isRoot: !subdomain,
  };
};

export const getBrowserTenant = () => {
  if (typeof window === 'undefined') {
    return cloneDefaultTenant();
  }
  const host = window.location?.host || window.location?.hostname || '';
  return parseTenantFromHost(host);
};

export { DEFAULT_TENANT };

