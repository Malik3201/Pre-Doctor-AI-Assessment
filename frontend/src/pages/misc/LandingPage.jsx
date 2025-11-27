import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  Stethoscope,
  Users,
  Lock,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Settings,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Select from '../../components/ui/Select';
import useTenant from '../../hooks/useTenant';
import useAuth from '../../hooks/useAuth';

export default function LandingPage() {
  const { isRoot } = useTenant();
  const { isAuthenticated } = useAuth();
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [demoForm, setDemoForm] = useState({
    hospitalName: '',
    contactName: '',
    role: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    console.log('Demo request:', demoForm);
    // TODO: Wire to backend API
    alert('Thank you! We will contact you shortly to schedule a demo.');
    setDemoForm({
      hospitalName: '',
      contactName: '',
      role: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      question: 'Is this a diagnostic tool?',
      answer:
        'No. Pre-Doctor AI is a pre-assessment and triage tool that helps structure patient information before appointments. It does not provide diagnoses. All reports are reviewed by licensed physicians who make final clinical decisions.',
    },
    {
      question: 'How long does implementation take?',
      answer:
        'Most hospitals are up and running within 1-2 weeks. Setup includes subdomain configuration, branding customization, doctor onboarding, and staff training. We provide dedicated support throughout the process.',
    },
    {
      question: 'Can we use our own domain?',
      answer:
        'Yes. While we provide subdomains by default (<hospital>.predoctorai.online), enterprise plans support custom domain integration. Contact us to discuss domain setup requirements.',
    },
    {
      question: 'Does it work with multiple hospital branches?',
      answer:
        'Absolutely. Pre-Doctor AI is built as a multi-tenant platform. Each branch or hospital in your network gets its own portal, branding, AI usage limits, and analytics while maintaining centralized group administration.',
    },
    {
      question: 'How are AI costs controlled?',
      answer:
        'Each hospital plan includes a monthly AI checkup quota. Admins can monitor usage in real-time, set per-doctor limits, and upgrade plans as needed. Usage analytics help optimize costs and ensure budget compliance.',
    },
    {
      question: 'What data security measures are in place?',
      answer:
        'We use enterprise-grade security: encrypted data transmission (TLS), encrypted storage, role-based access control, audit logs, and regular security audits. Data is stored in secure cloud infrastructure with HIPAA-ready architecture.',
    },
    {
      question: 'Can we integrate with our existing EMR/HIS?',
      answer:
        'Integration capabilities vary by plan. Enterprise plans include API access for EMR integration. Contact us to discuss your specific system requirements and integration timeline.',
    },
  ];

  // Redirect non-root visitors
    if (!isRoot) {
    return null; // Will be handled by App.jsx routing
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/predocAi-logo.png" alt="Pre-Doctor AI" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-xl font-bold text-slate-900">Pre-Doctor AI</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollToSection('product')}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('for-hospitals')}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
            >
              For hospitals
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
            >
              Security
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors cursor-pointer"
            >
              Login
            </Link>
            <Button
              onClick={() => scrollToSection('contact')}
              className="bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 cursor-pointer"
            >
              Book a demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-300">
                <Activity className="h-4 w-4" />
                Built for OPD-heavy hospitals
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                AI-Powered Pre-Assessment for Hospitals, Before the Patient Enters OPD
        </h1>
              <p className="mb-8 text-lg leading-relaxed text-slate-300 md:text-xl">
                Reduce OPD load, standardize pre-assessment, and give your doctors more focused time
                with each patient.
              </p>
              <div className="mb-8 space-y-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-400" />
                  <span>Multi-tenant SaaS for hospital networks</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-400" />
                  <span>AI pre-checkup, not diagnosis</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-400" />
                  <span>Branded under your hospital domain</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={() => scrollToSection('contact')}
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 cursor-pointer"
                >
                  Book a live demo
                  <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
                <Button
                  onClick={() => scrollToSection('sample-report')}
                  variant="outline"
                  size="lg"
                  className="border-slate-600 text-white hover:bg-slate-700/50 cursor-pointer"
                >
                  View sample report
          </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-transparent blur-2xl"></div>
              <Card className="relative border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur">
                <div className="mb-4 flex items-center justify-between border-b border-slate-700 pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      AI Pre-Assessment Report
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Patient: John D. • Age: 45</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Moderate Risk
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Chief Complaint</p>
                    <p className="text-sm text-slate-800">Chest pain and shortness of breath</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">AI Summary</p>
                    <p className="text-sm leading-relaxed text-slate-700">
                      Patient reports intermittent chest discomfort with exertion. History suggests
                      cardiovascular risk factors. Recommend ECG and cardiac markers.
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Suggested Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700">
                        Angina
                      </span>
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700">
                        Hypertension
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-medium text-slate-500">Today's Pre-Assessed</p>
                    <p className="text-3xl font-bold text-slate-900">127</p>
                    <p className="mt-1 text-xs text-slate-500">patients across all departments</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Strip */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-6 text-center text-sm font-medium text-slate-600">
            Built for OPD-heavy hospitals and clinics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>Designed for multi-branch hospitals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>Ready for audit-friendly reporting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>AI usage controls & quotas per hospital</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>Role-based access control</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section id="for-hospitals" className="bg-white py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Built for Hospital Administrators
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Understand the challenges your teams face and how Pre-Doctor AI addresses them
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="mb-6 text-xl font-semibold text-slate-900">
                What hospital teams struggle with today
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium text-slate-900">OPD queues and long history taking</h4>
                  <p className="text-slate-600">
                    Patients wait hours, and doctors spend valuable consultation time collecting basic
                    information that could be captured beforehand.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-slate-900">Doctors repeating the same questions</h4>
                  <p className="text-slate-600">
                    Every consultation starts from scratch. Physicians ask routine questions that take
                    time away from actual diagnosis and treatment planning.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-slate-900">Lack of structured pre-visit data</h4>
                  <p className="text-slate-600">
                    No standardized way to capture patient information before appointments, leading to
                    inconsistent data quality and missed opportunities for triage.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-6 text-xl font-semibold text-teal-600">
                What Pre-Doctor AI changes
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-slate-900">
                      Patients arrive with a structured pre-assessment
                    </h4>
                    <p className="text-slate-600">
                      AI-guided checkups capture symptoms, medical history, and risk factors before the
                      appointment, saving time and improving data quality.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-slate-900">
                      Doctors see summary + risk level before talking
                    </h4>
                    <p className="text-slate-600">
                      Physicians access pre-assessed reports with AI summaries, risk stratification, and
                      suggested conditions, enabling more focused consultations.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-slate-900">
                      Admins get analytics across departments
                    </h4>
                    <p className="text-slate-600">
                      Real-time dashboards show patient volumes, common conditions, AI usage, and
                      department-level insights for better resource planning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview Cards */}
      <section id="product" className="bg-slate-50 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              One platform for pre-assessment, triage and insight
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Everything your hospital needs to streamline patient intake and empower your care teams
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'AI Patient Pre-Checkup',
                description:
                  'Guided AI conversations capture symptoms, history, and risk factors. Generates structured reports with risk levels and suggested conditions.',
                color: 'teal',
              },
              {
                icon: Building2,
                title: 'Hospital-Branded Reports & PDFs',
                description:
                  'Every report carries your hospital logo, colors, and branding. Export to PDF for patient records or EMR integration.',
                color: 'emerald',
              },
              {
                icon: Users,
                title: 'Multi-tenant admin for groups and branches',
                description:
                  'Manage multiple hospitals from one dashboard. Each branch gets its own portal, branding, and AI usage limits.',
                color: 'violet',
              },
              {
                icon: Settings,
                title: 'AI usage controls & subscription plans',
                description:
                  'Set monthly quotas, monitor usage in real-time, and scale plans as your hospital grows. Full cost transparency.',
                color: 'amber',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              const colorClasses = {
                teal: 'bg-teal-100 text-teal-600',
                emerald: 'bg-emerald-100 text-emerald-600',
                violet: 'bg-violet-100 text-violet-600',
                amber: 'bg-amber-100 text-amber-600',
              };
              return (
                <Card
                  key={idx}
                  className="group transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[feature.color]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </Card>
            );
          })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              How it fits into your OPD workflow
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Three simple steps to transform your patient intake process
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: 1,
                title: 'Patient starts AI checkup',
                description:
                  'Patients access your hospital-branded portal via link, QR code, or kiosk. AI guides them through a structured symptom assessment.',
                icon: Globe,
              },
              {
                step: 2,
                title: 'AI generates structured report',
                description:
                  'AI analyzes responses, asks follow-up questions, and creates a comprehensive pre-assessment report with risk levels and suggested conditions.',
                icon: FileText,
              },
              {
                step: 3,
                title: 'Doctors access pre-assessed patients',
                description:
                  'Physicians review reports in your portal before consultations. Structured data enables faster, more focused patient interactions.',
                icon: Stethoscope,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                      {item.step}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="leading-relaxed text-slate-600">{item.description}</p>
                  {idx < 2 && (
                    <div className="absolute -right-4 top-12 hidden text-slate-300 md:block">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </section>

      {/* Multi-tenant & IT Section */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Built for hospital networks and IT teams
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Enterprise-grade multi-tenancy designed for healthcare organizations
            </p>
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <Globe className="h-5 w-5 text-teal-600" />
                    Subdomain per hospital
                  </h3>
                  <p className="text-slate-600">
                    Each hospital gets its own subdomain (<code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">&lt;hospital&gt;.predoctorai.online</code>) or
                    custom domain. Complete isolation of data, branding, and access controls.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <Settings className="h-5 w-5 text-teal-600" />
                    Separate branding & AI limits
                  </h3>
                  <p className="text-slate-600">
                    Customize logos, colors, and branding per hospital. Set individual AI usage quotas
                    and subscription plans. Each hospital operates independently within your network.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <Users className="h-5 w-5 text-teal-600" />
                    Central controls for groups
                  </h3>
                  <p className="text-slate-600">
                    Super admins manage multiple hospitals from one dashboard. Monitor usage across
                    branches, allocate resources, and maintain oversight while preserving hospital
                    autonomy.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
              <div className="mb-6 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  <Users className="h-4 w-4" />
                  Group Admin
                </div>
              </div>
              <div className="grid gap-4">
                {['Hospital A', 'Hospital B', 'Hospital C'].map((name, idx) => (
                  <Card key={idx} className="border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">AI checks: 1,247 / 2,000</p>
                      </div>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-teal-600"
                          style={{ width: `${(1247 / 2000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="bg-white py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Security and clinical responsibility
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Enterprise-grade security with clear clinical boundaries
            </p>
          </div>
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-4 flex items-center gap-3">
                <Lock className="h-6 w-6 text-teal-600" />
                <h3 className="text-xl font-semibold text-slate-900">Data Security</h3>
              </div>
              <p className="leading-relaxed text-slate-700">
                All patient data is encrypted in transit (TLS) and at rest. We use secure cloud
                infrastructure with regular security audits, access logging, and
                compliance monitoring. Role-based access control ensures only authorized staff can view
                patient information.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-teal-600" />
                <h3 className="text-xl font-semibold text-slate-900">Clinical Responsibility</h3>
              </div>
              <p className="leading-relaxed text-slate-700">
                Pre-Doctor AI provides pre-assessment and triage support, not medical diagnosis. All
                reports are reviewed by licensed physicians who make final clinical decisions. The
                platform clearly communicates to patients that AI-generated reports are informational
                and must be validated by healthcare professionals. We maintain strict boundaries
                between AI assistance and clinical judgment.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="mb-4 flex items-center gap-3">
                <Activity className="h-6 w-6 text-teal-600" />
                <h3 className="text-xl font-semibold text-slate-900">Audit & Compliance</h3>
              </div>
              <p className="leading-relaxed text-slate-700">
                Complete audit trails for all patient interactions, AI usage, and administrative
                actions. Export reports for regulatory compliance. Our architecture is designed with
                HIPAA-ready principles, though final compliance certification depends on your specific
                implementation and local regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample AI Report */}
      <section id="sample-report" className="bg-slate-50 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              What your doctors see before the patient walks in
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Structured, actionable pre-assessment reports that save time and improve care quality
            </p>
          </div>
          <Card className="border-slate-300 shadow-xl">
            <div className="mb-6 border-b border-slate-200 pb-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Pre-Assessment Report
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">Sarah M. Johnson</h3>
                </div>
                <div className="rounded-full bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-700">
                  Moderate Risk
                </div>
              </div>
              <div className="grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Age</p>
                  <p className="mt-1 font-semibold text-slate-900">42 years</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Gender</p>
                  <p className="mt-1 font-semibold text-slate-900">Female</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Date</p>
                  <p className="mt-1 font-semibold text-slate-900">March 15, 2024</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Chief Complaint</h4>
                <p className="text-slate-700">Persistent headaches and blurred vision for 2 weeks</p>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">AI Summary</h4>
                <p className="leading-relaxed text-slate-700">
                  Patient reports increasing frequency of headaches, particularly in the morning, with
                  associated blurred vision. No history of migraines. Blood pressure concerns noted in
                  family history. Recommend neurological examination and blood pressure monitoring.
                </p>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Suggested Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {['Hypertension', 'Migraine', 'Vision disorder'].map((condition, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Recommended Tests</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                  <li>Blood pressure measurement</li>
                  <li>Complete blood count (CBC)</li>
                  <li>Ophthalmological examination</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Pricing designed for hospitals of all sizes
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Flexible plans that scale with your organization
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Starter',
                description: 'Single hospital',
                features: [
                  'Up to 500 AI checkups/month',
                  'Hospital-branded portal',
                  'Basic analytics dashboard',
                  'Email support',
                ],
                color: 'teal',
              },
              {
                name: 'Pro',
                description: 'Multi-branch hospital',
                features: [
                  'Up to 5,000 AI checkups/month',
                  'Multi-branch management',
                  'Advanced analytics & reporting',
                  'Priority support',
                  'Custom domain support',
                ],
                color: 'emerald',
                popular: true,
              },
              {
                name: 'Enterprise',
                description: 'Network/group',
                features: [
                  'Unlimited AI checkups',
                  'Unlimited hospitals',
                  'API access & EMR integration',
                  'Dedicated account manager',
                  'Custom implementation',
                  'SLA guarantee',
                ],
                color: 'violet',
              },
            ].map((plan, idx) => {
              const colorClasses = {
                teal: 'bg-teal-600',
                emerald: 'bg-emerald-600',
                violet: 'bg-violet-600',
              };
              return (
                <Card
  key={idx}
  className={`relative flex h-full flex-col ${
    plan.popular ? 'border-2 border-emerald-500 shadow-lg' : ''
  }`}
>
  {plan.popular && (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
      <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
        Most Popular
      </span>
    </div>
  )}

  {/* Wrap all content except button */}
  <div className="flex flex-col flex-1">
    <div className="mb-6">
      <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
    </div>

    <ul className="space-y-3">
      {plan.features.map((feature, fIdx) => (
        <li key={fIdx} className="flex items-start gap-2 text-sm text-slate-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Button forced to bottom via mt-6 */}
  <Button
    onClick={() => scrollToSection('contact')}
    className={`mt-6 w-full ${colorClasses[plan.color]} hover:opacity-90 cursor-pointer`}
  >
    Talk to us for pricing
  </Button>
</Card>

              );
            })}
          </div>
          <p className="mt-12 text-center text-sm text-slate-600">
            All plans include security, compliance features, and regular platform updates. Contact us
            for implementation timelines and custom pricing.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              What hospital leaders say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Real outcomes from healthcare organizations using Pre-Doctor AI
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                role: 'Medical Director',
                name: 'Dr. Priya Sharma',
                hospital: 'Metro General Hospital',
                quote:
                  'We reduced average OPD consultation time by 30%. Doctors now focus on diagnosis rather than history-taking. The structured reports are invaluable.',
                metric: '30% faster consultations',
              },
              {
                role: 'Head of OPD',
                name: 'Dr. James Chen',
                hospital: 'City Medical Center',
                quote:
                  'Patient satisfaction improved significantly. They appreciate completing assessments at their own pace. Our staff can triage more effectively.',
                metric: 'Higher patient satisfaction',
              },
              {
                role: 'IT Lead',
                name: 'Michael Rodriguez',
                hospital: 'Regional Health Network',
                quote:
                  'Implementation was smooth. The multi-tenant architecture lets us manage 12 branches from one dashboard. Usage analytics help us optimize costs.',
                metric: '12 branches managed',
              },
            ].map((testimonial, idx) => (
              <Card key={idx}>
                <div className="mb-4 flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">
                      ★
                </span>
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-slate-700">"{testimonial.quote}"</p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="mt-1 text-xs text-slate-500">{testimonial.hospital}</p>
                  <p className="mt-3 text-xs font-medium text-teal-600">{testimonial.metric}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Common questions from hospital administrators and IT teams
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card
                key={idx}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    {activeFAQ === idx && (
                      <p className="mt-3 leading-relaxed text-slate-700">{faq.answer}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${activeFAQ === idx ? 'rotate-180' : ''}`}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Demo Form */}
      <section id="contact" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to see Pre-Doctor AI for your hospital?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Share a few details and we'll schedule a live demo with your team
            </p>
          </div>
          <Card className="border-slate-200 bg-white shadow-xl">
            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="hospitalName" className="text-slate-700">
                    Hospital Name *
                  </Label>
                  <Input
                    id="hospitalName"
                    required
                    value={demoForm.hospitalName}
                    onChange={(e) => setDemoForm({ ...demoForm, hospitalName: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
                    placeholder="Metro General Hospital"
                  />
                </div>
                <div>
                  <Label htmlFor="contactName" className="text-slate-700">
                    Contact Person Name *
                  </Label>
                  <Input
                    id="contactName"
                    required
                    value={demoForm.contactName}
                    onChange={(e) => setDemoForm({ ...demoForm, contactName: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
                    placeholder="Dr. Sarah Johnson"
                  />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="role" className="text-slate-700">
                    Role *
                  </Label>
                  <Select
                    id="role"
                    required
                    value={demoForm.role}
                    onChange={(e) => setDemoForm({ ...demoForm, role: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900"
                  >
                    <option value="">Select role</option>
                    <option value="medical-director">Medical Director</option>
                    <option value="hospital-admin">Hospital Administrator</option>
                    <option value="it-lead">IT Lead</option>
                    <option value="opd-head">Head of OPD</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-700">
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                    className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700">
                  Work Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={demoForm.email}
                  onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
                  placeholder="sarah.johnson@hospital.com"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-slate-700">
                  Message / Notes
                </Label>
                <textarea
                  id="message"
                  rows={4}
                  value={demoForm.message}
                  onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-500"
                  placeholder="Tell us about your hospital's needs, current patient volume, or any specific questions..."
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 cursor-pointer"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Request a demo
              </Button>
            </form>
          </Card>
        </div>
        </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-teal-600" />
                <span className="text-lg font-bold text-slate-900">Pre-Doctor AI</span>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                AI-powered pre-assessment platform for hospitals and clinics.
              </p>
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Pre-Doctor AI. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-slate-900">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <button
                    onClick={() => scrollToSection('product')}
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    Product
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('security')}
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    Security
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-slate-900">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link to="/privacy-policy" className="hover:text-teal-600 transition-colors cursor-pointer">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
            <p>
              For hospitals and clinics only – not a consumer medical app. All medical decisions are
              made by licensed healthcare professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
