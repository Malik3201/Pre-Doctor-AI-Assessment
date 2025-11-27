import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Heart,
  FlaskConical,
  Apple,
  ShieldAlert,
  Home,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ErrorBanner from '../../components/shared/ErrorBanner';
import RiskBadge from '../../components/patient/RiskBadge';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';
import { usePatientBranding } from '../../context/PatientBrandingContext';

// Collapsible Section Component (same as PatientReportDetailPage)
function Section({ title, icon: Icon, children, gradient = 'from-blue-50 to-indigo-50', iconColor = 'text-blue-600', defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 shadow-lg transition-all`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-full bg-white p-3 shadow-md ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 rounded-2xl bg-white/80 p-4 backdrop-blur">
          {children}
        </div>
      )}
    </div>
  );
}

const MAX_FOLLOWUPS = 3;

const buildMessage = (sender, text) => ({
  id: `${Date.now()}-${Math.random()}`,
  sender,
  text,
  timestamp: new Date(),
});

const buildIntro = (assistantName) =>
  `Hello! I'm ${assistantName}, your AI health assistant. Tell me about your symptoms, and I'll ask a few follow-up questions before preparing a pre-assessment summary.`;

const openWhatsAppAppointment = (phoneNumber, doctorName, hospitalName) => {
  if (!phoneNumber) return;
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const doctorLabel = doctorName ? `with ${doctorName}` : '';
  const facilityLabel = hospitalName ? ` at ${hospitalName}` : '';
  const message = `Hi, I would like to book an appointment ${doctorLabel || facilityLabel || ''}. I have received an AI health assessment report.`;
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export default function PatientNewCheckupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assistantName, appointmentWhatsApp, hospitalName } = usePatientBranding();
  const [whatsAppNumber, setWhatsAppNumber] = useState(appointmentWhatsApp || '');
  const assistantGreeting = useMemo(() => buildIntro(assistantName || 'AI assistant'), [assistantName]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setWhatsAppNumber(appointmentWhatsApp || '');
  }, [appointmentWhatsApp]);

  useEffect(() => {
    if (appointmentWhatsApp) return;
    let isMounted = true;
    (async () => {
      try {
        const response = await apiClient.get('/hospital/settings');
        if (isMounted) {
          setWhatsAppNumber(response.data?.hospital?.settings?.appointmentWhatsApp || '');
        }
      } catch {
        // silent fallback
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [appointmentWhatsApp]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setShowReport(false);
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
        'Thanks for sharing all the details. I\'ve generated your complete health assessment report. You can review it now!'
      );
      showToast({ title: 'Assessment complete!', variant: 'success' });
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

  // Keep input focused whenever the chat is active and input is enabled
  useEffect(() => {
    if (!inputDisabled && !showReport) {
      inputRef.current?.focus();
    }
  }, [inputDisabled, showReport]);

  // Show report view after report is generated
  if (showReport && finalReport) {
    return (
      <PatientLayout
        title="Your Health Assessment"
        subtitle="AI-generated report based on your symptoms"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/app/reports')}>
            View all reports
          </Button>
        }
      >
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReport(false)}
                  className="h-10 w-10 rounded-full p-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Complete Health Report</h2>
                  <p className="text-sm text-slate-600">
                    Generated {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <RiskBadge level={finalReport.riskLevel} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/app/reports/${finalReport._id}`)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  View saved report
                </Button>
              </div>
            </div>

            {assistantIntro && (
              <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-blue-800 backdrop-blur">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <p>{assistantIntro}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Summary */}
          <Section title="Summary" icon={FileText} gradient="from-emerald-50 to-teal-50" iconColor="text-emerald-600">
            <p className="text-sm leading-relaxed text-slate-700">{finalReport.summary}</p>
          </Section>

          {/* Possible Conditions */}
          {finalReport.possibleConditions?.length > 0 && (
            <Section title="Possible Conditions" icon={Heart} gradient="from-rose-50 to-pink-50" iconColor="text-rose-600">
              <div className="space-y-3">
                {finalReport.possibleConditions.map((condition, idx) => (
                  <div
                    key={condition.name || idx}
                    className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">
                        {idx + 1}. {condition.name || 'Condition'}
                      </p>
                      {condition.probability && (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                          {condition.probability}
                        </span>
                      )}
                    </div>
                    {condition.notes && (
                      <p className="mt-2 text-sm text-slate-600">{condition.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recommended Tests */}
          {finalReport.recommendedTests?.length > 0 && (
            <Section title="Recommended Tests" icon={FlaskConical} gradient="from-violet-50 to-purple-50" iconColor="text-violet-600">
              <div className="space-y-3">
                {finalReport.recommendedTests.map((test, idx) => (
                  <div
                    key={test.name || idx}
                    className="flex items-start gap-3 rounded-xl border border-violet-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {test.name || 'Diagnostic test'}
                      </p>
                      {test.notes && (
                        <p className="mt-1 text-sm text-slate-600">{test.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Diet Plan */}
          {finalReport.dietPlan?.length > 0 && (
            <Section title="Diet Plan" icon={Apple} gradient="from-green-50 to-emerald-50" iconColor="text-green-600">
              <ul className="space-y-2">
                {finalReport.dietPlan.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* What to Avoid */}
          {finalReport.whatToAvoid?.length > 0 && (
            <Section title="What to Avoid" icon={ShieldAlert} gradient="from-orange-50 to-amber-50" iconColor="text-orange-600">
              <ul className="space-y-2">
                {finalReport.whatToAvoid.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                      ✕
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Home Care */}
          {finalReport.homeCare?.length > 0 && (
            <Section title="Home Care Guidance" icon={Home} gradient="from-sky-50 to-cyan-50" iconColor="text-sky-600">
              <ul className="space-y-2">
                {finalReport.homeCare.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Recommended Doctor */}
          {finalReport.recommendedDoctor && (
            <Section title="Recommended Doctor" icon={Stethoscope} gradient="from-indigo-50 to-blue-50" iconColor="text-indigo-600">
              <div className="space-y-2">
                <p className="text-lg font-bold text-slate-900">
                  {finalReport.recommendedDoctor.name}
                  {finalReport.recommendedDoctor.qualification && (
                    <span className="font-normal text-slate-700">
                      {', '}
                      {finalReport.recommendedDoctor.qualification}
                    </span>
                  )}
                </p>
                {finalReport.recommendedDoctor.specialization && (
                  <p className="text-sm font-medium text-slate-700">
                    {finalReport.recommendedDoctor.specialization}
                  </p>
                )}
                {finalReport.recommendedDoctor.timings && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Available:</span>{' '}
                    {finalReport.recommendedDoctor.timings}
                  </p>
                )}
                {finalReport.recommendedDoctor.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {finalReport.recommendedDoctor.description}
                  </p>
                )}
                {whatsAppNumber && (
                  <Button
                    onClick={() =>
                      openWhatsAppAppointment(
                        whatsAppNumber,
                        finalReport.recommendedDoctor.name,
                        hospitalName,
                      )
                    }
                    className="mt-4 w-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus-visible:ring-emerald-500"
                  >
                    <MessageCircle className="mr-2 h-4 w-4 text-white" />
                    Make Quick Appointment
                  </Button>
                )}
              </div>
            </Section>
          )}

          {whatsAppNumber && !finalReport.recommendedDoctor && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Need a doctor ASAP?</p>
                  <p className="text-xs text-slate-600">
                    Message the {hospitalName || 'care'} team on WhatsApp to secure the next available slot.
                  </p>
                </div>
                <Button
                  onClick={() => openWhatsAppAppointment(whatsAppNumber, null, hospitalName)}
                  className="w-full md:w-auto bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus-visible:ring-emerald-500"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-white" />
                  Make Quick Appointment
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={() => setShowReport(false)} variant="outline" className="flex-1">
              Back to Chat
            </Button>
            <Button onClick={resetSession} className="flex-1">
              Start New Checkup
            </Button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // Chat view
  return (
    <PatientLayout
      title="AI Health Check"
      subtitle={`Chat with ${assistantName} about your symptoms`}
    >
      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="mx-auto max-w-7xl">
        <Card className="flex h-[calc(100vh-16rem)] min-h-[500px] flex-col overflow-hidden p-0 md:h-[600px]">
          {/* Chat Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{assistantName}</h3>
                <p className="text-xs text-slate-600">
                  {chatLoading || finalizing ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 md:p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md md:max-w-[70%] ${
                    message.sender === 'assistant'
                      ? 'rounded-tl-sm border border-slate-100 bg-white text-slate-800'
                      : 'rounded-tr-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`mt-1 text-xs ${
                      message.sender === 'assistant' ? 'text-slate-400' : 'text-blue-100'
                    }`}
                  >
                    {message.timestamp?.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {(chatLoading || finalizing) && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-slate-600">
                    {finalizing ? 'Generating report...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}

            {/* View Report Button - Prominent in Chat */}
            {finalReport && !finalizing && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowReport(true)}
                  size="lg"
                  className="w-full max-w-md shadow-lg"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  View Complete Health Report
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="border-t border-slate-200 bg-white p-4 md:px-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  disabled={inputDisabled}
                  rows={1}
                  className="max-h-32 min-h-[44px] w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  placeholder={
                    finalReport
                      ? 'Assessment complete!'
                      : symptomInput
                      ? 'Type your answer...'
                      : 'Describe your symptoms...'
                  }
                />
                {waitingForAssistant && (
                  <p className="mt-2 text-xs text-slate-500">
                    {assistantName} is reviewing your details...
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={inputDisabled || !inputValue.trim()}
                className="h-11 w-11 rounded-full p-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {finalReport && (
            <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetSession}
                className="text-sm"
              >
                Start another checkup
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PatientLayout>
  );
}
