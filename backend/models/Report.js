import mongoose from 'mongoose';

const qaItemSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false }
);

const conditionSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    probability: { type: Number },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const recommendedTestSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    symptomInput: { type: String, required: true, trim: true },
    qaFlow: [qaItemSchema],
    summary: { type: String, required: true, trim: true },
    possibleConditions: [conditionSchema],
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    recommendedTests: [recommendedTestSchema],
    dietPlan: [{ type: String, trim: true }],
    whatToAvoid: [{ type: String, trim: true }],
    homeCare: [{ type: String, trim: true }],

    recommendedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    pdfUrl: { type: String, trim: true },

    source: { type: String, enum: ['AI', 'MANUAL'], default: 'AI' },
    modelInfo: { type: String, trim: true },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;

