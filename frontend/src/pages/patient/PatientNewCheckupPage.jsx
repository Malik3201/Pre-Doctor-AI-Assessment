import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Card from '../../components/ui/Card';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import ErrorBanner from '../../components/shared/ErrorBanner';
import RiskBadge from '../../components/patient/RiskBadge';
import apiClient from '../../api/apiClient';

export default function PatientNewCheckupPage() {
  const navigate = useNavigate();
  const [symptomInput, setSymptomInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [assistantIntro, setAssistantIntro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!symptomInput.trim()) {
      setError('Please describe your symptoms before submitting.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setAiResult(null);
    setAssistantIntro('');
    try {
      const response = await apiClient.post('/ai/health-check', {
        symptomInput: symptomInput.trim(),
        qaFlow: [],
      });
      setAiResult(response.data?.report);
      setAssistantIntro(response.data?.assistantIntro || '');
    } catch (err) {
      if (err?.response?.status === 403) {
        setError(
          err.response.data?.message ||
            'Your hospital has reached its AI usage limit for this billing period. Please try again later.',
        );
      } else {
        setError(err?.response?.data?.message || 'Unable to run the AI assessment right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PatientLayout
      title="New AI Checkup"
      subtitle="Share your symptoms for a structured pre-assessment."
      actions={
        aiResult && (
          <Button variant="outline" size="sm" onClick={() => navigate('/app/reports')}>
            View all reports
          </Button>
        )
      }
    >
      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-3 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Describe your symptoms</h3>
              <p className="text-sm text-slate-500">
                Include onset time, intensity, related conditions, and anything that improves or worsens the symptoms.
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="symptomInput">Symptom details</Label>
            <Textarea
              id="symptomInput"
              rows={10}
              value={symptomInput}
              onChange={(event) => setSymptomInput(event.target.value)}
              placeholder="Example: Fever for 3 days, headaches in the evening, mild chest tightness..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing symptoms...
              </div>
            ) : (
              'Run AI pre-assessment'
            )}
          </Button>
          <p className="text-xs text-slate-500">
            Your hospital may review AI usage. Results are not a diagnosis and should be shared with your doctor.
          </p>
          </form>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">AI result</h3>
          {!aiResult && !isSubmitting && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              Your AI pre-assessment will appear here after you submit your symptoms.
            </div>
          )}

          {isSubmitting && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Generating your report. This usually takes a few seconds.
            </div>
          )}

          {aiResult && (
            <div className="space-y-3">
              {assistantIntro && (
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{assistantIntro}</div>
              )}
              <div className="flex items-center justify-between">
                <RiskBadge level={aiResult.riskLevel} />
                <Button variant="ghost" size="sm" onClick={() => navigate(`/app/reports/${aiResult._id}`)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  View saved report
                </Button>
              </div>
              <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Summary</p>
                  <p className="mt-1 text-sm text-slate-700">{aiResult.summary}</p>
                </div>
                {aiResult.possibleConditions?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Possible conditions</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {aiResult.possibleConditions.slice(0, 3).map((condition, idx) => (
                        <li key={condition.name || idx}>{condition.name || condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiResult.recommendedTests?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Recommended tests</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {aiResult.recommendedTests.slice(0, 3).map((test, idx) => (
                        <li key={test.name || idx}>{test.name || test}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </PatientLayout>
  );
}

