import { useCallback, useEffect, useMemo, useState } from 'react';
import { Palette, RefreshCw, Save } from 'lucide-react';
import HospitalAdminLayout from '../../layouts/HospitalAdminLayout';
import Card from '../../components/ui/Card';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Switch from '../../components/ui/Switch';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';

const initialFormState = {
  name: '',
  logo: '',
  primaryColor: '#0f172a',
  secondaryColor: '#0ea5e9',
  emergencyText: '',
  aiInstructions: '',
  assistantName: '',
  assistantTone: 'empathetic',
  assistantLanguage: 'English (US)',
  assistantIntroTemplate: '',
  extraStyleInstructions: '',
  enabledFeatures: {
    dietPlan: true,
    testSuggestions: true,
    doctorRecommendation: true,
  },
};

const toneOptions = ['empathetic', 'neutral', 'formal'];
const languageOptions = ['English (US)', 'English (UK)', 'Arabic', 'Urdu'];

export default function HospitalSettingsPage() {
  const [form, setForm] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const SETTINGS_FORM_ID = 'hospital-settings-form';
  const { showToast } = useToast();

  const shapeFormFromResponse = (hospital) => ({
    name: hospital?.name || '',
    logo: hospital?.logo || '',
    primaryColor: hospital?.primaryColor || '#0f172a',
    secondaryColor: hospital?.secondaryColor || '#0ea5e9',
    emergencyText: hospital?.settings?.emergencyText || '',
    aiInstructions: hospital?.settings?.aiInstructions || '',
    assistantName: hospital?.settings?.assistantName || '',
    assistantTone: hospital?.settings?.assistantTone || 'empathetic',
    assistantLanguage: hospital?.settings?.assistantLanguage || 'English (US)',
    assistantIntroTemplate: hospital?.settings?.assistantIntroTemplate || '',
    extraStyleInstructions: hospital?.settings?.extraStyleInstructions || '',
    enabledFeatures: {
      dietPlan: hospital?.settings?.enabledFeatures?.dietPlan ?? true,
      testSuggestions: hospital?.settings?.enabledFeatures?.testSuggestions ?? true,
      doctorRecommendation: hospital?.settings?.enabledFeatures?.doctorRecommendation ?? true,
    },
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/hospital/settings');
      setForm(shapeFormFromResponse(response.data?.hospital));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load settings right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature, value) => {
    setForm((prev) => ({
      ...prev,
      enabledFeatures: {
        ...prev.enabledFeatures,
        [feature]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setNotification(null);
    try {
      const payload = {
        name: form.name,
        logo: form.logo,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        settings: {
          emergencyText: form.emergencyText,
          aiInstructions: form.aiInstructions,
          assistantName: form.assistantName,
          assistantTone: form.assistantTone,
          assistantLanguage: form.assistantLanguage,
          assistantIntroTemplate: form.assistantIntroTemplate,
          extraStyleInstructions: form.extraStyleInstructions,
          enabledFeatures: { ...form.enabledFeatures },
        },
      };

      const response = await apiClient.put('/hospital/settings', payload);
      setForm(shapeFormFromResponse(response.data?.hospital));
      setNotification({ type: 'success', message: 'Settings updated successfully.' });
      showToast({ title: 'Settings saved', variant: 'success' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to save settings.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({ title: 'Save failed', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const assistantPreview = useMemo(() => {
    if (!form.assistantIntroTemplate) {
      return `${form.assistantName || 'Your care team assistant'} is ready to guide patients with a ${
        form.assistantTone
      } voice.`;
    }
    return form.assistantIntroTemplate
      .replace('{{assistantName}}', form.assistantName || 'Assistant')
      .replace('{{tone}}', form.assistantTone);
  }, [form.assistantIntroTemplate, form.assistantName, form.assistantTone]);

  const registrationUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/patient/register` : '';

  const handleCopyRegistration = async () => {
    if (!registrationUrl) return;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      showToast({ title: 'Registration link copied', variant: 'success' });
    } catch {
      showToast({ title: 'Unable to copy link', variant: 'error' });
    }
  };

  return (
    <HospitalAdminLayout
      title="Brand & Assistant"
      subtitle="Tune hospital branding and customize the AI tone."
      hospitalName={form.name}
      actions={
        <Button type="submit" form={SETTINGS_FORM_ID} className="inline-flex items-center gap-2" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      }
    >
      {notification?.message && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            notification.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {notification.message}
        </div>
      )}
      {error && (
        <div className="mb-4 space-y-3">
          <ErrorBanner message={error} />
          <Button variant="outline" size="sm" onClick={fetchSettings}>
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
        <form id={SETTINGS_FORM_ID} className="space-y-8" onSubmit={handleSubmit}>
          <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Brand identity</h3>
                <p className="text-sm text-slate-500">
                  Update the visuals your patients see when they access the portal.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Hospital name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" name="logo" value={form.logo} onChange={handleInputChange} />
                {form.logo && (
                  <img
                    src={form.logo}
                    alt="Logo preview"
                    className="mt-3 h-12 w-auto rounded-md border border-slate-200 object-contain"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="primaryColor">Primary color</Label>
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  value={form.primaryColor}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="secondaryColor">Secondary color</Label>
                <Input
                  id="secondaryColor"
                  name="secondaryColor"
                  type="color"
                  value={form.secondaryColor}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergencyText">Emergency note</Label>
              <Textarea
                id="emergencyText"
                name="emergencyText"
                value={form.emergencyText}
                onChange={handleInputChange}
                rows={3}
                placeholder="e.g., Call our emergency hotline at ..."
              />
            </div>
          </Card>

          <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Assistant behavior</h3>
              <p className="text-sm text-slate-500">
                Shape how the AI greets and guides patients throughout their pre-check process.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="assistantName">Assistant name</Label>
                <Input
                  id="assistantName"
                  name="assistantName"
                  value={form.assistantName}
                  onChange={handleInputChange}
                  placeholder="Aurora Care"
                />
              </div>
              <div>
                <Label htmlFor="assistantTone">Tone</Label>
                <Select
                  id="assistantTone"
                  name="assistantTone"
                  value={form.assistantTone}
                  onChange={handleInputChange}
                >
                  {toneOptions.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="assistantLanguage">Language</Label>
                <Select
                  id="assistantLanguage"
                  name="assistantLanguage"
                  value={form.assistantLanguage}
                  onChange={handleInputChange}
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="aiInstructions">Guidance for AI</Label>
                <Textarea
                  id="aiInstructions"
                  name="aiInstructions"
                  rows={3}
                  value={form.aiInstructions}
                  onChange={handleInputChange}
                  placeholder="Specify triage rules, restrictions, or escalation paths."
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="assistantIntroTemplate">Intro template</Label>
                <Textarea
                  id="assistantIntroTemplate"
                  name="assistantIntroTemplate"
                  rows={4}
                  value={form.assistantIntroTemplate}
                  onChange={handleInputChange}
                  placeholder="Hello, I'm {{assistantName}}... "
                />
              </div>
              <div>
                <Label htmlFor="extraStyleInstructions">Extra style notes</Label>
                <Textarea
                  id="extraStyleInstructions"
                  name="extraStyleInstructions"
                  rows={4}
                  value={form.extraStyleInstructions}
                  onChange={handleInputChange}
                  placeholder="Maintain a calm tone, mention hospital name twice..."
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Switch
                checked={form.enabledFeatures.dietPlan}
                onChange={(value) => handleFeatureToggle('dietPlan', value)}
                label="Diet recommendations"
              />
              <Switch
                checked={form.enabledFeatures.testSuggestions}
                onChange={(value) => handleFeatureToggle('testSuggestions', value)}
                label="Test suggestions"
              />
              <Switch
                checked={form.enabledFeatures.doctorRecommendation}
                onChange={(value) => handleFeatureToggle('doctorRecommendation', value)}
                label="Doctor recommendations"
              />
            </div>
          </Card>

          <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Assistant preview</h3>
            <p className="mt-2 text-sm text-slate-500">
              Patients will see a greeting similar to this before they start describing symptoms.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-700">
              {assistantPreview}
            </div>
            <div className="mt-4">
              <Badge variant="neutral">Language: {form.assistantLanguage}</Badge>
            </div>
          </Card>

          <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Patient registration link</h3>
              <p className="mt-2 text-sm text-slate-500">
                Share this link so patients can sign up directly under this hospital's portal.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <Input readOnly value={registrationUrl} />
              <Button type="button" variant="outline" onClick={handleCopyRegistration}>
                Copy link
              </Button>
            </div>
          </Card>
        </form>
      )}
    </HospitalAdminLayout>
  );
}

