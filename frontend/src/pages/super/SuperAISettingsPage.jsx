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
    } catch (err) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Unable to update settings.',
      });
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

      <Card className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI provider</h3>
            <p className="text-sm text-slate-500">
              Choose the vendor powering symptom analysis. Hospitals inherit this setting.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner className="h-8 w-8 border-slate-300" />
          </div>
        ) : (
          <>
            <form id={SETTINGS_FORM_ID} className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                {providerOptions.map((provider) => (
                  <label
                    key={provider.value}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      form.aiProvider === provider.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="openaiModel">OpenAI model</Label>
                  <Input
                    id="openaiModel"
                    name="openaiModel"
                    value={form.openaiModel}
                    onChange={handleChange}
                    placeholder="e.g. gpt-4.1-mini"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Ensure this matches an enabled deployment in your OpenAI account.
                  </p>
                </div>
                <div>
                  <Label htmlFor="groqModel">Groq model</Label>
                  <Input
                    id="groqModel"
                    name="groqModel"
                    value={form.groqModel}
                    onChange={handleChange}
                    placeholder="e.g. mixtral-8x7b"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Used when Groq is selected or as a fallback. API keys stay on the server.
                  </p>
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end">
              <Button type="submit" form={SETTINGS_FORM_ID} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </SuperAdminLayout>
  );
}
