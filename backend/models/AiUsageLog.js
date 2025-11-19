import mongoose from 'mongoose';

const aiUsageLogSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['SYMPTOM_ANALYSIS'], required: true },
    provider: { type: String, enum: ['openai', 'groq'], required: true },
    model: { type: String, trim: true },
    tokensUsed: { type: Number, default: 0 },
    metadata: { type: Object },
  },
  { timestamps: true }
);

const AiUsageLog = mongoose.model('AiUsageLog', aiUsageLogSchema);

export default AiUsageLog;

