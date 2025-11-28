import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Globe2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Switch from '../../components/ui/Switch';
import Button from '../../components/ui/Button';
import Label from '../../components/ui/Label';
import Select from '../../components/ui/Select';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Spinner from '../../components/ui/Spinner';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';

const EMPTY_CONFIG = {
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

const SERVICE_ICON_OPTIONS = [
  { value: '', label: 'Select icon' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'primary-care', label: 'Primary care' },
  { value: 'telemedicine', label: 'Telemedicine' },
];

const LIMITS = {
  highlightStats: 4,
  services: 8,
  faqItems: 8,
  doctorsHighlightDoctorIds: 4,
};

const normalizeConfig = (raw) => ({
  ...EMPTY_CONFIG,
  ...(raw || {}),
  highlightStats: Array.isArray(raw?.highlightStats) ? raw.highlightStats : [],
  services: Array.isArray(raw?.services) ? raw.services : [],
  faqItems: Array.isArray(raw?.faqItems) ? raw.faqItems : [],
  doctorsHighlightDoctorIds: Array.isArray(raw?.doctorsHighlightDoctorIds)
    ? raw.doctorsHighlightDoctorIds.map((id) => id?.toString?.() || id).filter(Boolean)
    : [],
});

const trimString = (value = '') => (typeof value === 'string' ? value.trim() : '');

export default function HospitalPublicSitePage() {
  const FORM_ID = 'hospital-public-site-form';
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_CONFIG);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [doctorOptions, setDoctorOptions] = useState([]);

  const previewUrl =
    typeof window !== 'undefined' ? `${window.location.origin || ''}/` : 'https://your-hospital-domain/';

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/hospital/public-site');
      setHospitalInfo(response.data?.hospital || null);
      setForm(normalizeConfig(response.data?.publicSite));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load public site configuration right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDoctorOptions = useCallback(async () => {
    try {
      const response = await apiClient.get('/hospital/doctors', {
        params: { status: 'active', limit: 100 },
      });
      const doctors = response.data?.doctors || [];
      setDoctorOptions(
        doctors.map((doctor) => ({
          id: doctor._id,
          label: `${doctor.name}${doctor.specialization ? ` • ${doctor.specialization}` : ''}`,
        })),
      );
    } catch (err) {
      console.error('Unable to load doctors for highlight selector', err);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchDoctorOptions();
  }, [fetchConfig, fetchDoctorOptions]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleHighlightStatChange = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.highlightStats];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, highlightStats: next };
    });
  };

  const handleServiceChange = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.services];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, services: next };
    });
  };

  const handleFaqChange = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.faqItems];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, faqItems: next };
    });
  };

  const addListItem = (field) => {
    setForm((prev) => {
      const collection = prev[field];
      return { ...prev, [field]: [...collection, {}] };
    });
  };

  const removeListItem = (field, index) => {
    setForm((prev) => {
      const next = prev[field].filter((_, idx) => idx !== index);
      return { ...prev, [field]: next };
    });
  };

  const handleDoctorSelection = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setForm((prev) => ({
      ...prev,
      doctorsHighlightDoctorIds: values.slice(0, LIMITS.doctorsHighlightDoctorIds),
    }));
  };

  const payload = useMemo(() => {
    const serializeList = (items, fields) =>
      items
        .map((item) => {
          const serialized = {};
          fields.forEach((field) => {
            serialized[field] = trimString(item?.[field]);
          });
          return serialized;
        })
        .filter((item) => Object.values(item).some(Boolean));

    return {
      isEnabled: form.isEnabled,
      showLoginButton: form.showLoginButton,
      showPatientRegisterButton: form.showPatientRegisterButton,
      heroTitle: trimString(form.heroTitle),
      heroSubtitle: trimString(form.heroSubtitle),
      heroTagline: trimString(form.heroTagline),
      heroImageUrl: trimString(form.heroImageUrl),
      highlightStats: serializeList(form.highlightStats, ['label', 'value']),
      aboutHeading: trimString(form.aboutHeading),
      aboutBody: trimString(form.aboutBody),
      servicesHeading: trimString(form.servicesHeading),
      services: form.services
        .map((service) => ({
          title: trimString(service?.title),
          description: trimString(service?.description),
          iconKey: trimString(service?.iconKey),
        }))
        .filter((service) => service.title || service.description),
      showAiBanner: form.showAiBanner,
      aiBannerTitle: trimString(form.aiBannerTitle),
      aiBannerText: trimString(form.aiBannerText),
      showDoctorsHighlight: form.showDoctorsHighlight,
      doctorsHighlightHeading: trimString(form.doctorsHighlightHeading),
      doctorsHighlightDoctorIds: form.doctorsHighlightDoctorIds,
      showFaq: form.showFaq,
      faqHeading: trimString(form.faqHeading),
      faqItems: serializeList(form.faqItems, ['question', 'answer']),
      showContact: form.showContact,
      contactHeading: trimString(form.contactHeading),
      contactPhone: trimString(form.contactPhone),
      contactEmail: trimString(form.contactEmail),
      contactAddress: trimString(form.contactAddress),
      mapEmbedUrl: trimString(form.mapEmbedUrl),
    };
  }, [form]);

  const hasCustomConfig =
    !!(
      form.heroTitle ||
      form.aboutHeading ||
      form.aboutBody ||
      (form.highlightStats && form.highlightStats.length > 0) ||
      (form.services && form.services.length > 0) ||
      (form.faqItems && form.faqItems.length > 0)
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiClient.put('/hospital/public-site', payload);
      // Update hospital info if provided, but DON'T overwrite form state
      // The form already has what the user entered - keep it as-is after save
      if (response.data?.hospital) {
        setHospitalInfo(response.data.hospital);
      }
      showToast({ title: 'Public site updated', variant: 'success' });
      // Don't refetch - form state is already correct and matches what was saved
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to save public site settings.';
      showToast({ title: 'Save failed', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const disabledBanner = !form.isEnabled && !hasCustomConfig ? (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
      Public landing page is currently disabled. Visitors will still see fallback content.
    </div>
  ) : null;

  return (
    <HospitalAdminLayout
      title="Public hospital site"
      subtitle={
        hospitalInfo?.subdomain
          ? `Control what visitors see at https://${hospitalInfo.subdomain}.predoctorai.online`
          : 'Control what visitors see on your hospital subdomain.'
      }
      hospitalName={hospitalInfo?.name || 'Hospital'}
      actions={
        <Button type="submit" form={FORM_ID} disabled={isSaving} className="inline-flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      }
    >
      {error && (
        <div className="mb-6 space-y-4">
          <ErrorBanner message={error} />
          <Button variant="outline" size="sm" onClick={fetchConfig}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : (
        <form id={FORM_ID} className="space-y-8" onSubmit={handleSubmit}>
          {disabledBanner}

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Globe2 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">General</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Availability & navigation</h3>
                <p className="text-sm text-slate-500">
                  Toggle the public home page and choose which actions appear in the navbar.
                </p>
              </div>
              <div className="flex gap-4">
                <Switch
                  checked={form.isEnabled}
                  onChange={(value) => handleToggle('isEnabled', value)}
                  label="Enable public home page"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Switch
                checked={form.showLoginButton}
                onChange={(value) => handleToggle('showLoginButton', value)}
                label="Show Login button"
              />
              <Switch
                checked={form.showPatientRegisterButton}
                onChange={(value) => handleToggle('showPatientRegisterButton', value)}
                label="Show Patient Register button"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Live URL</p>
              <p className="mt-1 break-all text-xs text-slate-500">{previewUrl}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 inline-flex items-center gap-2"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Open live page
              </Button>
            </div>
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Hero section</h3>
              <p className="text-sm text-slate-500">
                Headline and image shown above the fold. Leave blank to fallback to your hospital name.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="heroTitle">Hero title</Label>
                <Input id="heroTitle" name="heroTitle" value={form.heroTitle} onChange={handleFieldChange} />
              </div>
              <div>
                <Label htmlFor="heroTagline">Tagline</Label>
                <Input id="heroTagline" name="heroTagline" value={form.heroTagline} onChange={handleFieldChange} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="heroSubtitle">Supporting text</Label>
                <Textarea
                  id="heroSubtitle"
                  name="heroSubtitle"
                  rows={3}
                  value={form.heroSubtitle}
                  onChange={handleFieldChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="heroImageUrl">Hero image URL</Label>
                <Input
                  id="heroImageUrl"
                  name="heroImageUrl"
                  placeholder="https://..."
                  value={form.heroImageUrl}
                  onChange={handleFieldChange}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use a wide illustration or photo. Transparent PNG or SVG works best.
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Highlight stats</h3>
                <p className="text-sm text-slate-500">Quick metrics shown under the hero section.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem('highlightStats')}
                disabled={form.highlightStats.length >= LIMITS.highlightStats}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add stat
              </Button>
            </div>
            {form.highlightStats.length === 0 && (
              <p className="text-sm text-slate-500">No custom stats yet. Default values will be shown.</p>
            )}
            <div className="space-y-4">
              {form.highlightStats.map((stat, index) => (
                <div key={`stat-${index}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Label</Label>
                      <Input value={stat.label || ''} onChange={(e) => handleHighlightStatChange(index, 'label', e.target.value)} />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input value={stat.value || ''} onChange={(e) => handleHighlightStatChange(index, 'value', e.target.value)} />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-rose-600"
                    onClick={() => removeListItem('highlightStats', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">About section</h3>
              <p className="text-sm text-slate-500">Tell visitors what makes your hospital unique.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="aboutHeading">Heading</Label>
                <Input id="aboutHeading" name="aboutHeading" value={form.aboutHeading} onChange={handleFieldChange} />
              </div>
              <div>
                <Label htmlFor="aboutBody">Body</Label>
                <Textarea
                  id="aboutBody"
                  name="aboutBody"
                  rows={4}
                  value={form.aboutBody}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Services grid</h3>
                <p className="text-sm text-slate-500">
                  Showcase key departments. Icon selection is optional but helps visually.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem('services')}
                disabled={form.services.length >= LIMITS.services}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add service
              </Button>
            </div>
            <div>
              <Label htmlFor="servicesHeading">Section heading</Label>
              <Input
                id="servicesHeading"
                name="servicesHeading"
                value={form.servicesHeading}
                onChange={handleFieldChange}
              />
            </div>
            {form.services.length === 0 && (
              <p className="text-sm text-slate-500">No custom services yet. Default departments will be shown.</p>
            )}
            <div className="space-y-4">
              {form.services.map((service, index) => (
                <div key={`service-${index}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Title</Label>
                      <Input value={service.title || ''} onChange={(e) => handleServiceChange(index, 'title', e.target.value)} />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <Select value={service.iconKey || ''} onChange={(e) => handleServiceChange(index, 'iconKey', e.target.value)}>
                        {SERVICE_ICON_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={service.description || ''}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-rose-600"
                    onClick={() => removeListItem('services', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">AI banner</h3>
                <p className="text-sm text-slate-500">Explain how AI pre-assessment works for your patients.</p>
              </div>
              <Switch
                checked={form.showAiBanner}
                onChange={(value) => handleToggle('showAiBanner', value)}
                label="Show AI banner"
              />
            </div>
            {form.showAiBanner && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="aiBannerTitle">Title</Label>
                  <Input id="aiBannerTitle" name="aiBannerTitle" value={form.aiBannerTitle} onChange={handleFieldChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="aiBannerText">Description</Label>
                  <Textarea
                    id="aiBannerText"
                    name="aiBannerText"
                    rows={3}
                    value={form.aiBannerText}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Featured doctors</h3>
                <p className="text-sm text-slate-500">Highlight up to four specialists from your roster.</p>
              </div>
              <Switch
                checked={form.showDoctorsHighlight}
                onChange={(value) => handleToggle('showDoctorsHighlight', value)}
                label="Show doctors highlight"
              />
            </div>
            {form.showDoctorsHighlight && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doctorsHighlightHeading">Heading</Label>
                  <Input
                    id="doctorsHighlightHeading"
                    name="doctorsHighlightHeading"
                    value={form.doctorsHighlightHeading}
                    onChange={handleFieldChange}
                  />
                </div>
                <div>
                  <Label>Doctors</Label>
                  <Select multiple value={form.doctorsHighlightDoctorIds} onChange={handleDoctorSelection} className="h-40">
                    {doctorOptions.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.label}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-2 text-xs text-slate-500">
                    Hold Ctrl/Cmd to select multiple doctors. Max {LIMITS.doctorsHighlightDoctorIds}.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">FAQ</h3>
                <p className="text-sm text-slate-500">Address common patient questions.</p>
              </div>
              <Switch checked={form.showFaq} onChange={(value) => handleToggle('showFaq', value)} label="Show FAQ" />
            </div>
            {form.showFaq && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="faqHeading">Section heading</Label>
                  <Input id="faqHeading" name="faqHeading" value={form.faqHeading} onChange={handleFieldChange} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem('faqItems')}
                  disabled={form.faqItems.length >= LIMITS.faqItems}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add question
                </Button>
                {form.faqItems.length === 0 && (
                  <p className="text-sm text-slate-500">No FAQ items yet. Click “Add question” to begin.</p>
                )}
                <div className="space-y-4">
                  {form.faqItems.map((item, index) => (
                    <div key={`faq-${index}`} className="rounded-2xl border border-slate-200 p-4">
                      <div className="space-y-3">
                        <div>
                          <Label>Question</Label>
                          <Input value={item.question || ''} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                        </div>
                        <div>
                          <Label>Answer</Label>
                          <Textarea
                            rows={3}
                            value={item.answer || ''}
                            onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-3 inline-flex items-center gap-2 text-sm text-rose-600"
                        onClick={() => removeListItem('faqItems', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-6 rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Contact & location</h3>
                <p className="text-sm text-slate-500">Phone, email, address, and optional map embed.</p>
              </div>
              <Switch
                checked={form.showContact}
                onChange={(value) => handleToggle('showContact', value)}
                label="Show contact section"
              />
            </div>
            {form.showContact && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="contactHeading">Section heading</Label>
                  <Input
                    id="contactHeading"
                    name="contactHeading"
                    value={form.contactHeading}
                    onChange={handleFieldChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    placeholder="+92 300 1234567"
                    value={form.contactPhone}
                    onChange={handleFieldChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    placeholder="info@hospital.com"
                    value={form.contactEmail}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="contactAddress">Address</Label>
                  <Textarea
                    id="contactAddress"
                    name="contactAddress"
                    rows={3}
                    value={form.contactAddress}
                    onChange={handleFieldChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="mapEmbedUrl">Map iframe URL</Label>
                  <Input
                    id="mapEmbedUrl"
                    name="mapEmbedUrl"
                    placeholder="https://www.google.com/maps/embed?..."
                    value={form.mapEmbedUrl}
                    onChange={handleFieldChange}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Paste the iframe src from Google Maps (optional). Visitors will see an embedded map.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </form>
      )}
    </HospitalAdminLayout>
  );
}


