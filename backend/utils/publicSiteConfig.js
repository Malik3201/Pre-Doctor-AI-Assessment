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
  return {
    ...defaults,
    ...raw,
    highlightStats: sanitizeStats(raw?.highlightStats),
    services: sanitizeServices(raw?.services),
    faqItems: sanitizeFaqItems(raw?.faqItems),
    doctorsHighlightDoctorIds: Array.isArray(raw?.doctorsHighlightDoctorIds)
      ? raw.doctorsHighlightDoctorIds
          .map((id) => {
            if (!id) return null;
            if (typeof id === 'string') return id;
            if (id.toString) return id.toString();
            return null;
          })
          .filter(Boolean)
      : [],
  };
};


