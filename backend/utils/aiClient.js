import OpenAI from 'openai';
import SystemSettings from '../models/SystemSettings.js';

// Lazy-loaded clients to ensure dotenv.config() has run
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
};



const getEffectiveAiConfig = async () => {
  const envDefaultProvider = process.env.AI_PROVIDER || 'openai';
  const envOpenaiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const envGroqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

  const settings = await SystemSettings.findOne({ key: 'global' });

  const aiProvider = settings?.aiProvider || envDefaultProvider;
  const openaiModel = settings?.openaiModel || envOpenaiModel;
  
  // Auto-fix deprecated Groq models
  let groqModel = settings?.groqModel || envGroqModel;
  const deprecatedModels = ['llama3-70b-8192', 'llama-3-70b-8192', 'llama3-8b-8192'];
  if (deprecatedModels.includes(groqModel)) {
    groqModel = 'openai/gpt-oss-20b'; // Use the new recommended model
    // Optionally update the database (non-blocking)
    if (settings) {
      settings.groqModel = groqModel;
      settings.save().catch((err) => console.error('Failed to update deprecated model:', err));
    }
  }

  

  return { aiProvider, openaiModel, groqModel };
};

const buildAssistantIntro = (template, assistantName, hospitalName) =>
  (template || "Hi, I'm {{assistantName}}, your AI health assistant for {{hospitalName}}.")
    .replace('{{assistantName}}', assistantName)
    .replace('{{hospitalName}}', hospitalName);

export const generateHealthAssessment = async ({
  hospital,
  symptomInput,
  qaFlow = [],
  doctors = [],
  patient,
}) => {
  const settings = hospital.settings || {};
  const enabledFeatures = settings.enabledFeatures || {};

  const assistantName = settings.assistantName || 'HealthAI';
  const assistantTone = settings.assistantTone || 'friendly';
  const assistantLanguage = settings.assistantLanguage || 'en';
  const assistantIntroTemplate = settings.assistantIntroTemplate;
  const extraStyleInstructions = settings.extraStyleInstructions || '';
  const hospitalName = hospital.name || 'your hospital';
  const aiInstructions = settings.aiInstructions || '';
  const assistantIntro = buildAssistantIntro(
    assistantIntroTemplate,
    assistantName,
    hospitalName
  );

  const dietEnabled = enabledFeatures.dietPlan !== false;
  const testsEnabled = enabledFeatures.testSuggestions !== false;
  const doctorEnabled = enabledFeatures.doctorRecommendation !== false;

  const doctorSummaries = doctors.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    specialization: doc.specialization,
    expertiseTags: doc.expertiseTags || [],
  }));

  const patientAge = Number.isFinite(patient?.age) ? patient.age : 'Not provided';
  const patientGender = patient?.gender || 'prefer_not_to_say';
  const demographicSummary = `
Patient demographics:
- Age: ${patientAge}
- Gender: ${patientGender}
`.trim();

  const { aiProvider, openaiModel, groqModel } = await getEffectiveAiConfig();

  const systemPrompt = `
You are ${assistantName}, an AI health pre-assessment assistant for ${hospitalName}.
You must always remind users that you are not a doctor and cannot provide a final diagnosis.
Maintain a ${assistantTone} tone and respond in ${assistantLanguage}.
Use the assistantIntro value provided to greet the patient as part of your response data.
Provide structured JSON ONLY with the schema described.
Respect feature toggles:
- Diet plan enabled: ${dietEnabled}
- Tests enabled: ${testsEnabled}
- Doctor recommendation enabled: ${doctorEnabled}
If a feature is disabled, return an empty array or null as appropriate.
${aiInstructions || ''}
${extraStyleInstructions || ''}
`.trim();

  const userPrompt = `
Symptom Input:
${symptomInput}

Q&A Follow-up:
${JSON.stringify(qaFlow || [], null, 2)}

${demographicSummary}

Available Doctors:
${JSON.stringify(doctorSummaries, null, 2)}

Respond ONLY with valid JSON following this schema:
{
  "assistantIntro": "string, greet the user using assistantName and hospital name",
  "summary": "string",
  "possibleConditions": [{"name": "string", "probability": 0-1, "notes": "string"}],
  "riskLevel": "low" | "medium" | "high",
  "recommendedTests": [{"name": "string", "priority": "low"|"medium"|"high"|"urgent", "notes": "string"}],
  "dietPlan": ["string"...],
  "whatToAvoid": ["string"...],
  "homeCare": ["string"...],
  "recommendedDoctorId": "doctor id from provided list, or null",
  "modelInfo": "optional string to describe approach"
}
`.trim();

  let response;

  if (aiProvider === 'openai') {
    const openaiClient = getOpenAIClient();
    if (!openaiClient) {
      throw new Error(
        'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file or switch to Groq provider via Super Admin settings.'
      );
    }

    response = await openaiClient.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
  } else if (aiProvider === 'groq') {
    const groqClient = getGroqClient();
    if (!groqClient) {
      throw new Error(
        'Groq API key not configured. Please set GROQ_API_KEY in your .env file or switch to OpenAI provider via Super Admin settings.'
      );
    }

    response = await groqClient.chat.completions.create({
      model: groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
  } else {
    throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI response missing content');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to parse AI response JSON');
  }

  const {
    summary,
    possibleConditions = [],
    riskLevel = 'low',
    recommendedTests = [],
    dietPlan = [],
    whatToAvoid = [],
    homeCare = [],
    recommendedDoctorId = null,
    modelInfo,
  } = parsed;

  if (!summary || !riskLevel) {
    throw new Error('AI response missing required fields');
  }

  const finalData = {
    assistantIntro,
    summary,
    possibleConditions,
    riskLevel,
    recommendedTests: testsEnabled ? recommendedTests : [],
    dietPlan: dietEnabled ? dietPlan : [],
    whatToAvoid,
    homeCare,
    recommendedDoctorId: doctorEnabled ? recommendedDoctorId : null,
    modelInfo,
  };

  return {
    provider: aiProvider,
    model: aiProvider === 'openai' ? openaiModel : groqModel,
    data: finalData,
    usage: {
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
};

export default generateHealthAssessment;

export const generateCheckupFollowup = async ({ hospital, symptomInput, qaFlow = [], patient }) => {
  const settings = hospital.settings || {};
  const assistantName = settings.assistantName || 'HealthAI';
  const assistantTone = settings.assistantTone || 'friendly';
  const assistantLanguage = settings.assistantLanguage || 'en';
  const hospitalName = hospital.name || 'your hospital';
  const aiInstructions = settings.aiInstructions || '';
  const extraStyleInstructions = settings.extraStyleInstructions || '';

  const patientAge = Number.isFinite(patient?.age) ? patient.age : 'Not provided';
  const patientGender = patient?.gender || 'prefer_not_to_say';

  const askedQuestionsSummary =
    qaFlow.length > 0
      ? qaFlow
          .map(
            (item, index) =>
              `Q${index + 1}: ${item.question || 'Unknown question'}\nPatient answer: ${item.answer || 'Not provided'}`,
          )
          .join('\n')
      : 'No follow-up questions have been asked yet.';

  const systemPrompt = `
You are ${assistantName}, an AI assistant helping patients describe symptoms before a doctor's visit at ${hospitalName}.
You must collect enough structured information to run a final pre-assessment, but you do NOT give diagnoses in this chat.
Patient demographics are ALREADY known: Age ${patientAge}, Gender ${patientGender}. If you ask for age or gender, that is an error—never ask again.
Ask at most ONE new follow-up question per response and focus on the most critical missing data first.
Do not repeat or rephrase any question that already appears in the Q&A history. If information is already present, move on.
The server will stop you after three follow-up questions maximum, so assume you only get three chances.
Respond ONLY with strict JSON:
{"mode":"followup","followupQuestion":"clear, novel question","note":"brief guidance"} OR {"mode":"final","followupQuestion":null,"note":"short confirmation"}.
Maintain a ${assistantTone} tone in ${assistantLanguage}.
${aiInstructions || ''}
${extraStyleInstructions || ''}
`.trim();

  const userPrompt = `
Symptom Input:
${symptomInput}

Previously asked questions and answers:
${askedQuestionsSummary}

Patient demographics (do not ask about them):
- Age: ${patientAge}
- Gender: ${patientGender}
Do not ask for age or gender again; you already know them.
`.trim();

  const { aiProvider, openaiModel, groqModel } = await getEffectiveAiConfig();

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let response;
  if (aiProvider === 'openai') {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured.');
    }
    response = await client.chat.completions.create({
      model: openaiModel,
      messages,
      temperature: 0.2,
    });
  } else if (aiProvider === 'groq') {
    const client = getGroqClient();
    if (!client) {
      throw new Error('Groq API key not configured.');
    }
    response = await client.chat.completions.create({
      model: groqModel,
      messages,
      temperature: 0.2,
    });
  } else {
    throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI response missing content');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to parse AI response JSON');
  }

  const { mode, followupQuestion = null, note = null } = parsed;
  if (!mode || (mode === 'followup' && !followupQuestion)) {
    throw new Error('AI follow-up response missing required fields');
  }

  return { mode, followupQuestion, note };
};
