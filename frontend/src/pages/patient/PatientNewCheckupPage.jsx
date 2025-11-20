import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ErrorBanner from '../../components/shared/ErrorBanner';
import RiskBadge from '../../components/patient/RiskBadge';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';
import { usePatientBranding } from '../../context/PatientBrandingContext';

const MAX_FOLLOWUPS = 3;

const buildMessage = (sender, text) => ({
  id: `${Date.now()}-${Math.random()}`,
  sender,
  text,
});

const buildIntro = (assistantName) =>
  `Hello! I'm ${assistantName}, your AI health assistant. Tell me about your symptoms, and I'll ask a few follow-up questions before preparing a pre-assessment summary.`;

export default function PatientNewCheckupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assistantName } = usePatientBranding();
  const assistantGreeting = useMemo(() => buildIntro(assistantName || 'AI assistant'), [assistantName]);

  const [messages, setMessages] = useState(() => [buildMessage('assistant', assistantGreeting)]);
  const [inputValue, setInputValue] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [qaFlow, setQaFlow] = useState([]);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [assistantIntro, setAssistantIntro] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMessages((prev) => {
      if (!symptomInput && prev.length === 1 && prev[0].sender === 'assistant') {
        return [{ ...prev[0], text: assistantGreeting }];
      }
      return prev;
    });
  }, [assistantGreeting, symptomInput]);

  const appendMessage = (sender, text) => {
    if (!text) return;
    setMessages((prev) => [...prev, buildMessage(sender, text)]);
  };

  const resetSession = () => {
    setMessages([buildMessage('assistant', assistantGreeting)]);
    setInputValue('');
    setSymptomInput('');
    setQaFlow([]);
    setPendingQuestion(null);
    setFinalReport(null);
    setAssistantIntro('');
    setError('');
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!inputValue.trim() || chatLoading || finalizing) return;

    const text = inputValue.trim();
    appendMessage('user', text);
    setInputValue('');
    setError('');

    if (!symptomInput) {
      setSymptomInput(text);
      await requestNextStep(text, []);
    } else if (pendingQuestion) {
      const updatedFlow = [...qaFlow, { question: pendingQuestion, answer: text }];
      setQaFlow(updatedFlow);
      setPendingQuestion(null);
      await requestNextStep(symptomInput, updatedFlow);
    }
  };

  const requestNextStep = async (symptom, flow) => {
    try {
      setChatLoading(true);
      const { data } = await apiClient.post('/ai/checkup/chat', {
        symptomInput: symptom,
        qaFlow: flow,
      });

      const followupCount = Array.isArray(flow) ? flow.length : 0;
      const maxReached = followupCount >= MAX_FOLLOWUPS;

      const shouldFinalize =
        data.mode === 'final' ||
        !data.followupQuestion ||
        maxReached ||
        followupCount >= MAX_FOLLOWUPS;

      if (shouldFinalize) {
        await finalizeReport(symptom, flow);
        setPendingQuestion(null);
        return;
      }

      setPendingQuestion(data.followupQuestion);
      appendMessage('assistant', data.followupQuestion);
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Unable to continue the AI checkup conversation right now.';
      setError(message);
      showToast({ title: 'Chat error', description: message, variant: 'error' });
    } finally {
      setChatLoading(false);
    }
  };

  const finalizeReport = async (symptom, flow) => {
    try {
      setFinalizing(true);
      const { data } = await apiClient.post('/ai/health-check', { symptomInput: symptom, qaFlow: flow });
      setFinalReport(data.report);
      setAssistantIntro(data.assistantIntro || '');
      appendMessage(
        'assistant',
        'Thanks for sharing all the details. I’ve generated your pre-assessment summary, which you can review now.'
      );
      showToast({ title: 'Pre-assessment ready', variant: 'success' });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Unable to generate the final report. Please try again or contact your hospital.';
      if (err?.response?.status === 403) {
        const quotaMessage =
          err.response.data?.message ||
          'Your hospital has reached its AI usage limit for this billing period. Please contact the hospital administration.';
        setError(quotaMessage);
        showToast({ title: 'AI usage limit', description: quotaMessage, variant: 'warning' });
      } else {
        setError(message);
        showToast({ title: 'Report generation failed', description: message, variant: 'error' });
      }
    } finally {
      setFinalizing(false);
    }
  };

  const waitingForAssistant = Boolean(symptomInput && !pendingQuestion && !finalReport);
  const inputDisabled = chatLoading || finalizing || waitingForAssistant || Boolean(finalReport);

  return (
    <PatientLayout
      title="New AI Checkup"
      subtitle={`Share your symptoms. ${assistantName} will guide you through follow-up questions.`}
      actions={
        finalReport && (
          <Button variant="outline" size="sm" onClick={() => navigate('/app/reports')}>
            View all reports
          </Button>
        )
      }
    >
      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex h-[520px] flex-col">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-3 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{assistantName}</h3>
              <p className="text-sm text-slate-500">
                Provide details about your symptoms. {assistantName} will ask a few follow-up questions and then prepare a
                pre-assessment summary.
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  message.sender === 'assistant'
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'ml-auto bg-blue-600 text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
            {(chatLoading || finalizing) && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                Assistant is thinking…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {symptomInput ? pendingQuestion || 'Add extra details' : 'Describe your symptoms'}
              </label>
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={inputDisabled}
                rows={pendingQuestion ? 3 : 4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                placeholder={
                  symptomInput
                    ? 'Answer the follow-up question with as much detail as possible.'
                    : 'Example: Fever for 3 days, headaches in the evening, mild chest tightness...'
                }
              />
              {waitingForAssistant && (
                <p className="mt-2 text-xs text-slate-500">
                  {assistantName} is reviewing your details. A follow-up question will appear in a moment.
                </p>
              )}
            </div>
            <Button type="submit" disabled={inputDisabled || !inputValue.trim()}>
              {finalReport ? 'Complete' : 'Send'}
            </Button>
          </form>

          {finalReport && (
            <Button type="button" variant="ghost" className="mt-3 text-sm" onClick={resetSession}>
              Start another checkup
            </Button>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900">AI result</h3>
          </div>
          {!finalReport && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              Once the assistant determines it has enough information, your structured pre-assessment will appear here.
            </div>
          )}

          {finalReport && (
            <div className="space-y-3">
              {assistantIntro && (
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{assistantIntro}</div>
              )}
              <div className="flex items-center justify-between">
                <RiskBadge level={finalReport.riskLevel} />
                <Button variant="ghost" size="sm" onClick={() => navigate(`/app/reports/${finalReport._id}`)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  View saved report
                </Button>
              </div>
              <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Summary</p>
                  <p className="mt-1 text-sm text-slate-700">{finalReport.summary}</p>
                </div>
                {finalReport.possibleConditions?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Possible conditions</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {finalReport.possibleConditions.slice(0, 3).map((condition, idx) => (
                        <li key={condition.name || idx}>{condition.name || condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {finalReport.recommendedTests?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Recommended tests</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {finalReport.recommendedTests.slice(0, 3).map((test, idx) => (
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

