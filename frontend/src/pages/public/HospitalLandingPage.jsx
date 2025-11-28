import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Baby,
  CheckCircle2,
  ChevronDown,
  HeartPulse,
  Laptop2,
  Mail,
  MapPin,
  Phone,
  Scan,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
  Clock,
  Award,
  Building2,
} from 'lucide-react';
import apiClient from '../../api/apiClient';

const FALLBACK_STATS = [
  { label: 'OPD visits / month', value: '12,000+' },
  { label: 'Specialists on duty', value: '85+' },
  { label: 'AI pre-assessed patients', value: '4,500+' },
];

const FALLBACK_SERVICES = [
  { title: 'Emergency & Trauma', description: '24/7 emergency physicians, resuscitation bays, and rapid imaging access.', iconKey: 'emergency' },
  { title: 'Cardiology & Cath Lab', description: 'Comprehensive cardiac diagnostics, cath lab, and post-intervention monitoring.', iconKey: 'cardiology' },
  { title: 'Women & Child Health', description: 'OB/GYN, pediatrics, neonatal ICU, and lactation specialists under one roof.', iconKey: 'pediatrics' },
  { title: 'Diagnostics & Imaging', description: 'MRI, CT, ultrasound, and full laboratory with same-day turnaround.', iconKey: 'diagnostics' },
];

const FALLBACK_FAQ = [
  {
    question: 'Is the AI making diagnoses?',
    answer:
      'No. AI simply structures your symptoms before a doctor sees you. Every medical decision is taken by our licensed physicians.',
  },
  {
    question: 'Can I walk in without completing AI pre-assessment?',
    answer:
      'Yes. AI pre-assessment is optional but recommended so your doctor can review a structured summary before you arrive.',
  },
];

const servicesIconMap = {
  cardiology: HeartPulse,
  surgery: Activity,
  emergency: Shield,
  pediatrics: Baby,
  diagnostics: Scan,
  radiology: Scan,
  orthopedics: Users,
  'primary-care': Stethoscope,
  'telemedicine': Laptop2,
};

const getServiceIcon = (key) => servicesIconMap[key] || Sparkles;

const HeroPlaceholder = () => (
  <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-sm">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
    <div className="relative space-y-5 text-sm text-white/95">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">AI Pre-Assessment Report</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">Chief complaint</p>
          <p className="text-base font-semibold text-white">Chest tightness with exertion</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">AI Summary</p>
          <p className="leading-relaxed text-white/90">Structured symptom capture with escalation suggestions for your care team.</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">Suggested next steps</p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-center gap-2 text-sm text-white/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              ECG + cardiac markers
            </li>
            <li className="flex items-center gap-2 text-sm text-white/90">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Consult cardiology within 24h
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default function HospitalLandingPage() {
  const [hospital, setHospital] = useState(null);
  const [publicSite, setPublicSite] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const fetchDoctors = useCallback(async (ids) => {
    if (!ids?.length) {
      setDoctors([]);
      return;
    }
    setDoctorLoading(true);
    try {
      const response = await apiClient.get('/public/hospital-doctors', {
        params: { ids: ids.join(',') },
        __isPublicRequest: true,
      });
      setDoctors(response.data?.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors highlight', err);
      setDoctors([]);
    } finally {
      setDoctorLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/public/hospital-site', { __isPublicRequest: true });
        setHospital(response.data?.hospital || null);
        const config = response.data?.publicSite || {};
        setPublicSite(config);
        if (config?.showDoctorsHighlight && config?.doctorsHighlightDoctorIds?.length) {
          fetchDoctors(config.doctorsHighlightDoctorIds);
        }
        document.title = `${response.data?.hospital?.name || 'Hospital'} | Pre-Doctor AI`;
      } catch (err) {
        setError(err?.response?.data?.message || 'Hospital not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [fetchDoctors]);

  const content = useMemo(() => {
    if (!hospital) return null;
    const cfg = publicSite || {};
    const brandName = hospital.name || 'Hospital';
    const heroTitle = cfg.heroTitle || `${brandName} • Patient-first care`;
    const heroSubtitle =
      cfg.heroSubtitle ||
      'Modern care, emergency readiness, and AI-assisted pre-assessment—so your doctor sees your story before you reach the room.';
    const heroTagline =
      cfg.heroTagline || 'Powered by Pre-Doctor AI · Secure pre-assessment before every OPD visit.';

    const highlightStats =
      cfg.highlightStats?.length > 0 ? cfg.highlightStats : FALLBACK_STATS;

    const services =
      cfg.services?.length > 0
        ? cfg.services
        : FALLBACK_SERVICES;

    const faqItems =
      cfg.showFaq && cfg.faqItems?.length > 0
        ? cfg.faqItems
        : cfg.showFaq
        ? FALLBACK_FAQ
        : [];

    const contact = {
      heading: cfg.contactHeading || `Contact ${brandName}`,
      phone: cfg.contactPhone || '+92 300 0000000',
      email: cfg.contactEmail || 'info@hospital.com',
      address:
        cfg.contactAddress ||
        `${brandName} OPD Block, Main Road, City. Open 24/7 for ER.`,
      mapEmbedUrl: cfg.mapEmbedUrl || '',
    };

    return {
      heroTitle,
      heroSubtitle,
      heroTagline,
      heroImageUrl: cfg.heroImageUrl,
      highlightStats,
      aboutHeading: cfg.aboutHeading || `About ${brandName}`,
      aboutBody:
        cfg.aboutBody ||
        `${brandName} combines experienced physicians with AI-guided pre-assessment so your consultation starts with richer context. Our care teams coordinate across OPD, emergency, and virtual follow-ups.`,
      servicesHeading: cfg.servicesHeading || 'Departments & services',
      services,
      showAiBanner: cfg.showAiBanner !== false,
      aiBannerTitle: cfg.aiBannerTitle || 'AI-powered intake built for your doctors',
      aiBannerText:
        cfg.aiBannerText ||
        'Patients answer structured questions from home or at kiosks. Doctors receive summaries, risk levels, and suggested actions before the visit.',
      showDoctorsHighlight: cfg.showDoctorsHighlight,
      doctorsHeading: cfg.doctorsHighlightHeading || 'Featured specialists',
      doctorIds: cfg.doctorsHighlightDoctorIds || [],
      showFaq: cfg.showFaq,
      faqHeading: cfg.faqHeading || 'Frequently asked questions',
      faqItems,
      showContact: cfg.showContact !== false,
      contact,
      isEnabled: cfg.isEnabled,
    };
  }, [hospital, publicSite]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
          <p className="text-sm font-medium text-slate-600">Loading hospital site…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <p className="text-lg font-semibold text-slate-900">{error}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-blue-600 transition hover:text-blue-700">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  if (!content || !hospital) {
    return null;
  }

  const brandColors = {
    primary: hospital.primaryColor || '#0ea5e9',
    secondary: hospital.secondaryColor || '#0f172a',
  };

  const hasCustomConfig =
    !!publicSite &&
    !!(
      publicSite.heroTitle ||
      publicSite.aboutHeading ||
      (publicSite.highlightStats && publicSite.highlightStats.length > 0) ||
      (publicSite.services && publicSite.services.length > 0) ||
      (publicSite.faqItems && publicSite.faqItems.length > 0)
    );

  const isDisabledBanner = content.isEnabled === false && !hasCustomConfig;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased" style={{ '--brand-primary': brandColors.primary, '--brand-secondary': brandColors.secondary }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/95 backdrop-blur-md shadow-sm transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {hospital.logo ? (
              <img src={hospital.logo} alt={hospital.name} className="h-12 w-12 rounded-xl border-2 border-slate-200 object-cover shadow-sm transition hover:shadow-md" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xl font-bold text-white shadow-md">
                {hospital.name?.charAt(0) || 'H'}
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Hospital</p>
              <p className="text-lg font-bold text-slate-900">{hospital.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {content.showLoginButton !== false && (
              <Link
                to="/auth/login"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
              >
                Login
              </Link>
            )}
            {content.showPatientRegisterButton !== false && (
              <Link
                to="/auth/patient/register"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: brandColors.primary }}
              >
                Patient Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {isDisabledBanner && (
        <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 py-2.5 text-center">
          <p className="text-xs font-medium text-amber-800">
            This hospital is configuring their new website. Showing default information for now.
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${brandColors.secondary}40, ${brandColors.primary}40)`,
          }}
        ></div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">{content.heroTagline}</p>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {content.heroTitle}
              </h1>
              <p className="text-lg leading-relaxed text-slate-200 sm:text-xl">{content.heroSubtitle}</p>
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  to="/auth/patient/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Start AI pre-assessment
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
                >
                  Doctor login
                </Link>
              </div>
            </div>
            <div className="relative lg:pl-8">
              {content.heroImageUrl ? (
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src={content.heroImageUrl}
                    alt="Hospital hero"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                </div>
              ) : (
                <HeroPlaceholder />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.highlightStats.map((stat, index) => (
              <div
                key={`stat-${index}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative">
                  <p className="text-4xl font-extrabold text-slate-900 sm:text-5xl">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <div className="inline-block">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">About us</p>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{content.aboutHeading}</h2>
              <p className="text-lg leading-relaxed text-slate-600">{content.aboutBody}</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-lg">
              {[
                {
                  icon: Sparkles,
                  title: 'AI-assisted intake',
                  description: 'Patients complete a guided pre-assessment so doctors see risk scores and summaries before the visit.',
                },
                {
                  icon: Users,
                  title: 'Coordinated care',
                  description: 'OPD, emergency, and virtual follow-ups share the same patient story for continuity.',
                },
                {
                  icon: Shield,
                  title: 'Hospital-grade privacy',
                  description: "Built on Pre-Doctor AI's secure multi-tenant architecture with role-based controls.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Departments</p>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">{content.servicesHeading}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Specialist-led departments supported by AI-guided triage.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {content.services.map((service, index) => {
              const Icon = getServiceIcon(service.iconKey);
              return (
                <div
                  key={`service-${index}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-sm transition-transform group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                      <p className="mt-2 leading-relaxed text-slate-600">{service.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Banner */}
      {content.showAiBanner && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className="relative overflow-hidden rounded-3xl px-8 py-12 text-white shadow-2xl sm:px-12 sm:py-16"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
              <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">AI Pre-Assessment</p>
                  </div>
                  <h3 className="text-3xl font-extrabold sm:text-4xl">{content.aiBannerTitle}</h3>
                  <p className="text-lg leading-relaxed text-white/90">{content.aiBannerText}</p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                  {[
                    'Patients answer questions from home or kiosks',
                    'AI summarizes symptoms + risk level',
                    'Doctors review before meeting the patient',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <CheckCircle2 className="h-4 w-4 text-amber-300" />
                      </div>
                      <span className="text-sm font-medium text-white/95">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Doctors Section */}
      {content.showDoctorsHighlight && (
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Care team</p>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">{content.doctorsHeading}</h2>
            </div>
            {doctorLoading && (
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"></div>
                <p className="text-sm text-slate-500">Loading doctors…</p>
              </div>
            )}
            {!doctorLoading && doctors.length === 0 && (
              <p className="text-center text-sm text-slate-500">Highlighted doctors will appear here soon.</p>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-lg font-bold text-white shadow-md">
                      {doctor.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-600">{doctor.specialization}</p>
                      {doctor.qualification && (
                        <p className="mt-0.5 text-xs text-slate-500">{doctor.qualification}</p>
                      )}
                    </div>
                  </div>
                  {doctor.description && (
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{doctor.description}</p>
                  )}
                  {doctor.expertiseTags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {doctor.expertiseTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {content.showFaq && content.faqItems.length > 0 && (
        <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">FAQ</p>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">{content.faqHeading}</h2>
            </div>
            <div className="space-y-3">
              {content.faqItems.map((item, index) => (
                <div
                  key={`faq-${index}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="pr-8 text-base font-semibold text-slate-900 sm:text-lg">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                      <p className="leading-relaxed text-slate-600">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {content.showContact && (
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-lg sm:p-10">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Contact</p>
                  <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">{content.contact.heading}</h2>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                      <a href={`tel:${content.contact.phone}`} className="mt-1 block text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        {content.contact.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                      <a href={`mailto:${content.contact.email}`} className="mt-1 block text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        {content.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
                      <p className="mt-1 text-base leading-relaxed text-slate-700">{content.contact.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              {content.contact.mapEmbedUrl && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-lg">
                  <iframe
                    src={content.contact.mapEmbedUrl}
                    title="Hospital map"
                    width="100%"
                    height="100%"
                    className="h-full min-h-[400px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-lg font-bold">{hospital.name}</p>
              <p className="mt-1 text-sm text-slate-400">
                © {new Date().getFullYear()} {hospital.name}. All rights reserved.
              </p>
            </div>
            <div className="text-sm text-slate-400">
              Powered by{' '}
              <a
                href="https://predoctorai.online"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-white transition hover:text-blue-400"
              >
                Pre-Doctor AI
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
