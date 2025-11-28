import Hospital from '../models/Hospital.js';

const RESERVED_SUBDOMAINS = new Set(['www', 'api']); // 'api' is used by Vercel/production

const extractSubdomain = (host = '') => {
  const [hostname] = host.split(':'); // remove port if present
  if (!hostname) return null;

  if (hostname === 'localhost' || hostname.startsWith('localhost')) {
    return null;
  }

  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return null; // e.g., domain.com

  const sub = parts[0].toLowerCase();
  if (RESERVED_SUBDOMAINS.has(sub)) {
    return null;
  }

  return sub;
};

export const tenantResolver = async (req, res, next) => {
  try {
    const host = req.headers.host || '';
    let subdomain = null;

    // Method 1: Check custom header FIRST (works when calling Vercel/production backend)
    // Frontend sends X-Tenant-Subdomain header extracted from window.location
    if (req.headers['x-tenant-subdomain']) {
      subdomain = req.headers['x-tenant-subdomain'];
      console.log('✅ Subdomain from X-Tenant-Subdomain header:', subdomain);
    }

    // Method 2: Extract from Host header as fallback (works for local development with proxy)
    if (!subdomain && host) {
      const [hostname] = host.split(':'); // remove port
      const parts = hostname.split('.');

      // LOCALHOST case: alshifa.localhost
      if (parts.length === 2 && parts[1] === 'localhost' && parts[0] !== 'www') {
        subdomain = parts[0];
      }
      // PRODUCTION case: alshifa.yourdomain.com (but skip reserved like 'api')
      else if (parts.length >= 3 && parts[0] !== 'www' && !RESERVED_SUBDOMAINS.has(parts[0])) {
        subdomain = parts[0];
      }
    }

    console.log('🔍 Tenant detection:', {
      host: host,
      subdomain: subdomain,
      customHeader: req.headers['x-tenant-subdomain'],
      method: subdomain ? (req.headers['x-tenant-subdomain'] ? 'custom-header' : 'host-header') : 'none'
    });

    req.subdomain = subdomain || null;
    req.hospital = null;

    // root domain (no subdomain) -> super admin / public context
    if (!subdomain) {
      console.log('⚠️ No subdomain detected, continuing without hospital context');
      return next();
    }

    // db se hospital find karo
    const hospital = await Hospital.findOne({
      subdomain: subdomain.toLowerCase().trim(),
    }).exec();

    if (!hospital) {
      // subdomain mila, lekin hospital db me nahi mila
      return next();
    }

    const isPublicRoute = typeof req.path === 'string' && req.path.startsWith('/api/public');
    const isActive = hospital.status === 'active';

    req.hospital = hospital;

    if (!isActive && !isPublicRoute) {
      return res.status(403).json({ message: 'Hospital is not active' });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

