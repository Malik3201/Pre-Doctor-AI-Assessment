const clone = (value) => JSON.parse(JSON.stringify(value));

const BASE_PUBLIC_SITE = {
  isEnabled: false,
  showLoginButton: true,
  showPatientRegisterButton: true,
  heroTitle: '',
  heroSubtitle: '',
  heroTagline: '',
  heroImageUrl: '',
  highlightStats: [],
  aboutHeading: '',
  aboutBody: '',
  servicesHeading: '',
  services: [],
  showAiBanner: true,
  aiBannerTitle: '',
  aiBannerText: '',
  showDoctorsHighlight: false,
  doctorsHighlightHeading: '',
  doctorsHighlightDoctorIds: [],
  showFaq: false,
  faqHeading: '',
  faqItems: [],
  showContact: true,
  contactHeading: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  mapEmbedUrl: '',
};

const trim = (value) => (typeof value === 'string' ? value.trim() : '');

const sanitizeStats = (stats) => {
  if (!Array.isArray(stats)) return [];
  return stats
    .map((stat) => ({
      label: trim(stat?.label),
      value: trim(stat?.value),
    }))
    .filter((stat) => stat.label || stat.value);
};

const sanitizeServices = (services) => {
  if (!Array.isArray(services)) return [];
  return services
    .map((service) => ({
      title: trim(service?.title),
      description: trim(service?.description),
      iconKey: trim(service?.iconKey),
    }))
    .filter((service) => service.title || service.description);
};

const sanitizeFaqItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      question: trim(item?.question),
      answer: trim(item?.answer),
    }))
    .filter((item) => item.question || item.answer);
};

export const getDefaultPublicSiteConfig = () => clone(BASE_PUBLIC_SITE);

export const mergePublicSiteConfig = (raw = {}) => {
  const defaults = getDefaultPublicSiteConfig();
  // Convert Mongoose document to plain object if needed
  const plainRaw = raw && typeof raw.toObject === 'function' ? raw.toObject() : raw;
  
  // Merge defaults with saved values, but only use defaults for truly missing fields
  const merged = {
    ...defaults,
    ...plainRaw,
    // Preserve boolean values explicitly (don't let defaults overwrite false/true)
    isEnabled: plainRaw?.isEnabled !== undefined ? Boolean(plainRaw.isEnabled) : defaults.isEnabled,
    showLoginButton: plainRaw?.showLoginButton !== undefined ? Boolean(plainRaw.showLoginButton) : defaults.showLoginButton,
    showPatientRegisterButton: plainRaw?.showPatientRegisterButton !== undefined ? Boolean(plainRaw.showPatientRegisterButton) : defaults.showPatientRegisterButton,
    showAiBanner: plainRaw?.showAiBanner !== undefined ? Boolean(plainRaw.showAiBanner) : defaults.showAiBanner,
    showDoctorsHighlight: plainRaw?.showDoctorsHighlight !== undefined ? Boolean(plainRaw.showDoctorsHighlight) : defaults.showDoctorsHighlight,
    showFaq: plainRaw?.showFaq !== undefined ? Boolean(plainRaw.showFaq) : defaults.showFaq,
    showContact: plainRaw?.showContact !== undefined ? Boolean(plainRaw.showContact) : defaults.showContact,
    // Preserve arrays and sanitize them
    highlightStats: sanitizeStats(plainRaw?.highlightStats),
    services: sanitizeServices(plainRaw?.services),
    faqItems: sanitizeFaqItems(plainRaw?.faqItems),
    doctorsHighlightDoctorIds: Array.isArray(plainRaw?.doctorsHighlightDoctorIds)
      ? plainRaw.doctorsHighlightDoctorIds
          .map((id) => {
            if (!id) return null;
            if (typeof id === 'string') return id;
            if (id.toString) return id.toString();
            return null;
          })
          .filter(Boolean)
      : defaults.doctorsHighlightDoctorIds,
  };
  
  return merged;
};


