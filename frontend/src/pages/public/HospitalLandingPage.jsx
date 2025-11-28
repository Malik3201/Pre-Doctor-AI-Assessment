import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Baby,
  CheckCircle2,
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
  <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
    <div className="space-y-4 text-sm text-white/90">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
        AI Pre-Assessment Report
      </p>
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
        <p className="text-xs text-white/70">Chief complaint</p>
        <p className="font-medium">Chest tightness with exertion</p>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
        <p className="text-xs text-white/70">AI Summary</p>
        <p>Structured symptom capture with escalation suggestions for your care team.</p>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
        <p className="text-xs text-white/70">Suggested next steps</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>ECG + cardiac markers</li>
          <li>Consult cardiology within 24h</li>
        </ul>
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading hospital site…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-600">
        <p className="text-lg font-semibold text-slate-900">{error}</p>
        <Link to="/" className="mt-4 text-sm text-blue-600 underline">
          Go back
        </Link>
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

  const primaryButtonClass =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl';
  const secondaryButtonClass =
    'inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition';

  const isDisabledBanner = content.isEnabled === false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ '--brand-primary': brandColors.primary, '--brand-secondary': brandColors.secondary }}>
      <div className="relative min-h-screen">
        <nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              {hospital.logo ? (
                <img src={hospital.logo} alt={hospital.name} className="h-10 w-10 rounded-full border border-white/20 object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold">
                  {hospital.name?.charAt(0) || 'H'}
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Hospital</p>
                <p className="text-lg font-semibold">{hospital.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {content.showLoginButton !== false && (
                <Link to="/auth/login" className={secondaryButtonClass}>
                  Login
                </Link>
              )}
              {content.showPatientRegisterButton !== false && (
                <Link
                  to="/auth/patient/register"
                  className={primaryButtonClass}
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Patient Register
                </Link>
              )}
            </div>
          </div>
        </nav>

        {isDisabledBanner && (
          <div className="bg-amber-50 py-3 text-center text-sm text-amber-800">
            This hospital is configuring their new website. Showing default information for now.
          </div>
        )}

        {/* Hero */}
        <section
          className="relative overflow-hidden bg-slate-900 px-6 py-20 text-white"
          style={{
            background: `linear-gradient(135deg, ${brandColors.secondary}, ${brandColors.primary})`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]"></div>
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/70">
                {content.heroTagline}
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">{content.heroTitle}</h1>
              <p className="mt-6 text-lg text-white/80">{content.heroSubtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth/patient/register"
                  className={primaryButtonClass}
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Start AI pre-assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/auth/login" className={secondaryButtonClass}>
                  Doctor login
                </Link>
              </div>
            </div>
            <div className="relative">
              {content.heroImageUrl ? (
                <img
                  src={content.heroImageUrl}
                  alt="Hospital hero"
                  className="rounded-3xl border border-white/20 shadow-2xl"
                />
              ) : (
                <HeroPlaceholder />
              )}
            </div>
          </div>
        </section>

        {/* Highlight stats */}
        <section className="bg-white py-10">
          <div className="mx-auto grid max-w-5xl gap-6 px-6 sm:grid-cols-3">
            {content.highlightStats.map((stat, index) => (
              <div key={`stat-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">About</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">{content.aboutHeading}</h2>
              <p className="mt-5 text-lg text-slate-600">{content.aboutBody}</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              {[
                {
                  title: 'AI-assisted intake',
                  description: 'Patients complete a guided pre-assessment so doctors see risk scores and summaries before the visit.',
                },
                {
                  title: 'Coordinated care',
                  description: 'OPD, emergency, and virtual follow-ups share the same patient story for continuity.',
                },
                {
                  title: 'Hospital-grade privacy',
                  description: 'Built on Pre-Doctor AI’s secure multi-tenant architecture with role-based controls.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Departments</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">{content.servicesHeading}</h2>
              <p className="mt-3 text-slate-600">
                Specialist-led departments supported by AI-guided triage.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {content.services.map((service, index) => {
                const Icon = getServiceIcon(service.iconKey);
                return (
                  <div
                    key={`service-${index}`}
                    className="rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI banner */}
        {content.showAiBanner && (
          <section className="py-16">
            <div
              className="mx-auto max-w-5xl rounded-3xl px-8 py-10 text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">AI Pre-Assessment</p>
                  <h3 className="mt-3 text-3xl font-bold">{content.aiBannerTitle}</h3>
                  <p className="mt-3 text-white/90">{content.aiBannerText}</p>
                </div>
                <div className="flex-1 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/90">
                  {[
                    'Patients answer questions from home or kiosks',
                    'AI summarizes symptoms + risk level',
                    'Doctors review before meeting the patient',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Doctors highlight */}
        {content.showDoctorsHighlight && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Care team</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{content.doctorsHeading}</h2>
              </div>
              {doctorLoading && (
                <p className="text-center text-sm text-slate-500">Loading doctors…</p>
              )}
              {!doctorLoading && doctors.length === 0 && (
                <p className="text-center text-sm text-slate-500">Highlighted doctors will appear here soon.</p>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/10 text-lg font-semibold text-slate-900">
                        {doctor.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{doctor.name}</p>
                        <p className="text-sm text-slate-500">{doctor.specialization}</p>
                        <p className="text-xs text-slate-400">{doctor.qualification}</p>
                      </div>
                    </div>
                    {doctor.description && <p className="mt-4 text-sm text-slate-600">{doctor.description}</p>}
                    {doctor.expertiseTags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {doctor.expertiseTags.map((tag) => (
                          <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
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

        {/* FAQ */}
        {content.showFaq && content.faqItems.length > 0 && (
          <section className="bg-slate-50 py-16">
            <div className="mx-auto max-w-4xl px-6">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">FAQ</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{content.faqHeading}</h2>
              </div>
              <div className="space-y-4">
                {content.faqItems.map((item, index) => (
                  <details key={`faq-${index}`} className="group rounded-2xl border border-slate-200 bg-white p-5">
                    <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-slate-900">
                      {item.question}
                      <span className="text-sm text-slate-500 transition group-open:rotate-180">⌄</span>
                    </summary>
                    <p className="mt-3 text-sm text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        {content.showContact && (
          <section className="bg-white py-16">
            <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Contact</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{content.contact.heading}</h2>
                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>{content.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span>{content.contact.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-4 w-4 text-slate-500" />
                    <span>{content.contact.address}</span>
                  </div>
                </div>
              </div>
              {content.contact.mapEmbedUrl && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-2">
                  <iframe
                    src={content.contact.mapEmbedUrl}
                    title="Hospital map"
                    width="100%"
                    height="320"
                    className="h-full w-full rounded-3xl"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-900 py-10 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center text-sm md:flex-row">
            <div>
              <p className="font-semibold">{hospital.name}</p>
              <p className="text-white/60">
                © {new Date().getFullYear()} {hospital.name}. All rights reserved.
              </p>
            </div>
            <div className="text-white/70">
              Powered by{' '}
              <a href="https://predoctorai.online" target="_blank" rel="noreferrer" className="underline">
                Pre-Doctor AI
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


