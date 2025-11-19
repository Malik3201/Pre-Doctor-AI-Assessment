import Hospital from '../models/Hospital.js';

const RESERVED_SUBDOMAINS = new Set(['www', 'api']);

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
    const host = req.headers.host || ''; // e.g. "alshifa.localhost:5000"
    if (!host) {
      req.subdomain = null;
      req.hospital = null;
      return next();
    }

    // port hatao
    const [hostname] = host.split(':'); // "alshifa.localhost"

    // hostname ko dot pe split karo
    const parts = hostname.split('.'); // ["alshifa", "localhost"] ya ["alshifa","yourdomain","com"]

    let subdomain = null;

    // LOCALHOST case: alshifa.localhost
    if (parts.length === 2 && parts[1] === 'localhost' && parts[0] !== 'www') {
      subdomain = parts[0]; // "alshifa"
    }
    // PRODUCTION case: alshifa.yourdomain.com
    else if (parts.length >= 3 && parts[0] !== 'www') {
      subdomain = parts[0]; // "alshifa"
    }

    req.subdomain = subdomain || null;
    req.hospital = null;

    // root domain (no subdomain) -> super admin / public context
    if (!subdomain) {
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

    if (hospital.status && hospital.status !== 'active') {
      return res.status(403).json({ message: 'Hospital is not active' });
    }

    req.hospital = hospital;
    return next();
  } catch (err) {
    return next(err);
  }
};

