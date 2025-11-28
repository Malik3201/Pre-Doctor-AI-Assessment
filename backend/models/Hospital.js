import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false }
);

const highlightStatSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    value: { type: String, trim: true },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    iconKey: { type: String, trim: true },
  },
  { _id: false }
);

const publicFaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false }
);

const publicSiteSchema = new mongoose.Schema(
  {
    isEnabled: { type: Boolean, default: false },
    showLoginButton: { type: Boolean, default: true },
    showPatientRegisterButton: { type: Boolean, default: true },
    heroTitle: { type: String, trim: true },
    heroSubtitle: { type: String, trim: true },
    heroTagline: { type: String, trim: true },
    heroImageUrl: { type: String, trim: true },
    highlightStats: {
      type: [highlightStatSchema],
      default: [],
    },
    aboutHeading: { type: String, trim: true },
    aboutBody: { type: String, trim: true },
    servicesHeading: { type: String, trim: true },
    services: {
      type: [serviceSchema],
      default: [],
    },
    showAiBanner: { type: Boolean, default: true },
    aiBannerTitle: { type: String, trim: true },
    aiBannerText: { type: String, trim: true },
    showDoctorsHighlight: { type: Boolean, default: false },
    doctorsHighlightHeading: { type: String, trim: true },
    doctorsHighlightDoctorIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
      default: [],
    },
    showFaq: { type: Boolean, default: false },
    faqHeading: { type: String, trim: true },
    faqItems: {
      type: [publicFaqSchema],
      default: [],
    },
    showContact: { type: Boolean, default: true },
    contactHeading: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactAddress: { type: String, trim: true },
    mapEmbedUrl: { type: String, trim: true },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },
    settings: {
      faqs: [faqSchema],
      emergencyText: { type: String },
      aiInstructions: { type: String },
      enabledFeatures: {
        dietPlan: { type: Boolean, default: true },
        testSuggestions: { type: Boolean, default: true },
        doctorRecommendation: { type: Boolean, default: true },
      },
      assistantName: { type: String, default: 'HealthAI' },
      assistantTone: { type: String, default: 'friendly' },
      assistantLanguage: { type: String, default: 'en' },
      assistantIntroTemplate: {
        type: String,
        default: "Hi, I'm {{assistantName}}, your AI health assistant for {{hospitalName}}.",
      },
      extraStyleInstructions: { type: String },
      appointmentWhatsApp: { type: String, trim: true }, // WhatsApp number for appointments
      tagline: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    publicSite: {
      type: publicSiteSchema,
      default: () => ({}),
    },
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    planName: { type: String, default: 'free' },
    maxAiChecksPerMonth: { type: Number, default: 100 },
    aiChecksUsedThisMonth: { type: Number, default: 0 },
    billingPeriodStart: { type: Date },
    billingPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Hospital', hospitalSchema);

