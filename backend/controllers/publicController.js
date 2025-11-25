export const getHospitalMeta = (req, res) => {
  const defaultMeta = {
    mode: 'global',
    name: 'Pre-Doctor AI',
    logo: null,
    primaryColor: '#0F62FE',
    secondaryColor: '#020617',
    tagline: 'Hospital Intelligence Suite',
  };

  const hospital = req?.hospital;
  const subdomain = req?.subdomain; // From tenantResolver middleware

  // If subdomain was provided but hospital not found, return not_found mode
  if (!hospital && subdomain) {
    return res.json({
      mode: 'not_found',
      subdomain: subdomain,
      message: 'Hospital not found',
      ...defaultMeta,
    });
  }

  // Root domain (no subdomain, no hospital)
  if (!hospital) {
    return res.json(defaultMeta);
  }

  if (hospital.status && hospital.status !== 'active') {
    return res.json({
      mode: 'inactive',
      name: hospital.name,
      subdomain: hospital.subdomain,
      status: hospital.status,
      message: 'This hospital portal is temporarily unavailable. Please contact the administrator.',
    });
  }

  return res.json({
    mode: 'hospital',
    name: hospital.name,
    subdomain: hospital.subdomain,
    logo: hospital.logo || null,
    primaryColor: hospital.primaryColor || defaultMeta.primaryColor,
    secondaryColor: hospital.secondaryColor || defaultMeta.secondaryColor,
    tagline: hospital.settings?.tagline || 'Patient pre-assessment & care coordination',
    city: hospital.settings?.city || null,
    country: hospital.settings?.country || null,
  });
};

