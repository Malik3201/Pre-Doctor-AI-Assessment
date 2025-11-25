import { useEffect, useState } from 'react';
import { Brain, RefreshCw, Save } from 'lucide-react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import Card from '../../components/ui/Card';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';

const providerOptions = [
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'Industry default. Supports GPT-4 class models.',
  },
  {
    value: 'groq',
    label: 'Groq',
    description: 'High-throughput inference via OpenAI-compatible API.',
  },
];

export default function SuperAISettingsPage() {
  const [form, setForm] = useState({ aiProvider: 'openai', openaiModel: '', groqModel: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const SETTINGS_FORM_ID = 'ai-settings-form';
  const { showToast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/super/settings/ai');
      setForm(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load AI configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setNotification(null);
    try {
      const response = await apiClient.put('/super/settings/ai', form);
      setForm(response.data);
      setNotification({ type: 'success', message: 'AI settings updated successfully.' });
      showToast({ title: 'AI settings saved', variant: 'success' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update settings.';
      setNotification({
        type: 'error',
        message,
      });
      showToast({ title: 'Failed to save AI settings', description: message, variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SuperAdminLayout
      title="Global AI Configuration"
      subtitle="Control the provider and default models used across every hospital."
      actions={
        <Button variant="outline" size="sm" onClick={fetchSettings} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
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
      {error && <ErrorBanner message={error} className="mb-4" />}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Spinner className="h-8 w-8 border-slate-300" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="space-y-8 rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500">
            <Brain className="h-5 w-5" />
          </div>
          <div>
                <h3 className="text-lg font-semibold text-slate-900">Provider & models</h3>
            <p className="text-sm text-slate-500">
                  Hospitals inherit this configuration. Updates roll out instantly across tenants.
            </p>
          </div>
        </div>

            <form id={SETTINGS_FORM_ID} className="space-y-8" onSubmit={handleSubmit}>
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Provider selection
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                {providerOptions.map((provider) => (
                  <label
                    key={provider.value}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      form.aiProvider === provider.value
                          ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                      <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{provider.label}</p>
                        <p className="text-xs text-slate-500">{provider.description}</p>
                      </div>
                      <input
                        type="radio"
                        name="aiProvider"
                        value={provider.value}
                        checked={form.aiProvider === provider.value}
                        onChange={handleChange}
                      />
                    </div>
                  </label>
                ))}
              </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">OpenAI settings</p>
                  <Label htmlFor="openaiModel">Model identifier</Label>
                  <Input
                    id="openaiModel"
                    name="openaiModel"
                    value={form.openaiModel}
                    onChange={handleChange}
                    placeholder="e.g. gpt-4.1-mini"
                  />
                  <p className="text-xs text-slate-500">
                    Ensure this deployment exists in your OpenAI org; requests fan out per tenant.
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Groq settings</p>
                  <Label htmlFor="groqModel">Model identifier</Label>
                  <Input
                    id="groqModel"
                    name="groqModel"
                    value={form.groqModel}
                    onChange={handleChange}
                    placeholder="e.g. mixtral-8x7b"
                  />
                  <p className="text-xs text-slate-500">
                    Used when Groq is selected or as fallback. Keys remain server-side.
                  </p>
                </div>
              </section>

              <div className="flex items-center justify-end gap-3">
              <Button type="submit" form={SETTINGS_FORM_ID} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">Current summary</p>
              <h4 className="mt-2 text-xl font-semibold text-slate-900">
                {form.aiProvider === 'openai' ? 'OpenAI' : 'Groq'} in production
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>
                  • Primary model:{' '}
                  <span className="font-semibold text-slate-900">
                    {form.aiProvider === 'openai' ? form.openaiModel || 'Not set' : form.groqModel || 'Not set'}
                  </span>
                </li>
                <li>
                  • Fallback:{' '}
                  <span className="font-semibold text-slate-900">
                    {form.aiProvider === 'openai'
                      ? form.groqModel || 'Groq disabled'
                      : form.openaiModel || 'OpenAI disabled'}
                  </span>
                </li>
                <li>• Changes propagate instantly across all hospital tenants.</li>
              </ul>
            </Card>

            <Card className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5 text-sm text-amber-800">
              <p className="font-semibold">Operational note</p>
              <p className="mt-2">
                Switching providers may impact latency and quota consumption. Coordinate with DevOps
                before toggling during peak hours.
              </p>
            </Card>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
