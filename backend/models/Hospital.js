import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
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

