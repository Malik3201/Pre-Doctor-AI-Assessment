import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const CNIC_REGEX = /^\d{13}$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PATIENT'],
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: function () {
        return this.role !== 'SUPER_ADMIN';
      },
      default: null,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    cnic: {
      type: String,
      trim: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { cnic: 1, role: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { role: 'PATIENT', cnic: { $exists: true, $type: 'string' } },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.pre('save', function (next) {
  // Normalize & validate CNIC only when it is present / being changed.
  if (this.role === 'PATIENT' && this.cnic != null) {
    const normalized = String(this.cnic).replace(/\D/g, '');
    if (!CNIC_REGEX.test(normalized)) {
      return next(new Error('Invalid CNIC format. Please provide 13 digits.'));
    }
    this.cnic = normalized;
  }
  return next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

