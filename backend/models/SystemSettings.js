import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    aiProvider: { type: String, enum: ['openai', 'groq'], default: 'openai' },
    openaiModel: { type: String, trim: true },
    groqModel: { type: String, trim: true },
  },
  { timestamps: true }
);

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;

