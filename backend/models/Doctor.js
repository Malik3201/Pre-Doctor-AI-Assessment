import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true, default: '' },
    experienceYears: { type: Number, default: 0 },
    expertiseTags: [{ type: String, trim: true }],
    timings: { type: String },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;

