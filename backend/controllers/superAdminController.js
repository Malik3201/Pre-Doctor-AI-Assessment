import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';
import AiUsageLog from '../models/AiUsageLog.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

const sanitizeHospital = (hospital) => {
  if (!hospital) return null;
  const obj = hospital.toObject();
  return obj;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user.toObject();
  return rest;
};

export const createHospital = async (req, res, next) => {
  try {
    const {
      name,
      subdomain,
      logo,
      primaryColor,
      secondaryColor,
      planName,
      maxAiChecksPerMonth,
      admin,
    } = req.body || {};

    if (!name || !subdomain || !admin) {
      return res.status(400).json({ message: 'Name, subdomain, and admin details are required' });
    }

    if (!admin.name || !admin.email || !admin.password) {
      return res.status(400).json({ message: 'Admin name, email, and password are required' });
    }

    const normalizedSubdomain = subdomain.trim().toLowerCase();

    const existingHospital = await Hospital.findOne({ subdomain: normalizedSubdomain });
    if (existingHospital) {
      return res.status(400).json({ message: 'Subdomain already in use' });
    }

    const hospital = await Hospital.create({
      name: name.trim(),
      subdomain: normalizedSubdomain,
      logo,
      primaryColor,
      secondaryColor,
      planName: planName || undefined,
      maxAiChecksPerMonth: maxAiChecksPerMonth || undefined,
    });

    const adminUser = await User.create({
      name: admin.name,
      email: admin.email,
      password: admin.password,
      role: 'HOSPITAL_ADMIN',
      hospital: hospital._id,
    });

    return res.status(201).json({
      hospital: sanitizeHospital(hospital),
      admin: sanitizeUser(adminUser),
    });
  } catch (err) {
    return next(err);
  }
};

export const getHospitals = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const hospitals = await Hospital.find(filter)
      .sort({ createdAt: -1 })
      .select('_id name subdomain status planName maxAiChecksPerMonth aiChecksUsedThisMonth createdAt');

    return res.json({
      count: hospitals.length,
      hospitals,
    });
  } catch (err) {
    return next(err);
  }
};

export const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // TODO: Add adminCount/patientCount analytics.
    return res.json({ hospital: sanitizeHospital(hospital) });
  } catch (err) {
    return next(err);
  }
};

export const updateHospitalStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const allowedStatuses = ['active', 'suspended', 'banned'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    return res.json({ hospital: sanitizeHospital(hospital) });
  } catch (err) {
    return next(err);
  }
};

export const resetHospitalAdminPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const admin = await User.findOne({ hospital: hospital._id, role: 'HOSPITAL_ADMIN' }).select(
      '+password'
    );

    if (!admin) {
      return res.status(404).json({ message: 'Hospital admin not found' });
    }

    admin.password = newPassword;
    await admin.save();

    return res.json({ message: 'Hospital admin password reset successfully' });
  } catch (err) {
    return next(err);
  }
};

export const getGlobalStats = async (req, res, next) => {
  try {
    const [
      totalHospitals,
      activeHospitals,
      bannedHospitals,
      totalUsers,
      totalPatients,
      totalHospitalAdmins,
      totalSuperAdmins,
      totalAiChecks,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ status: 'active' }),
      Hospital.countDocuments({ status: 'banned' }),
      User.countDocuments(),
      User.countDocuments({ role: 'PATIENT' }),
      User.countDocuments({ role: 'HOSPITAL_ADMIN' }),
      User.countDocuments({ role: 'SUPER_ADMIN' }),
      AiUsageLog.countDocuments(),
    ]);

    return res.json({
      totalHospitals,
      activeHospitals,
      bannedHospitals,
      totalUsers,
      totalPatients,
      totalHospitalAdmins,
      totalSuperAdmins,
      totalAiChecks,
      totalRevenue: 0, // TODO: integrate billing metrics
    });
  } catch (err) {
    return next(err);
  }
};

const buildAiSettingsResponse = (settings) => {
  const envProvider = process.env.AI_PROVIDER || 'openai';
  const envOpenaiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const envGroqModel = process.env.GROQ_MODEL || 'llama3-70b-8192';

  return {
    aiProvider: settings?.aiProvider || envProvider,
    openaiModel: settings?.openaiModel || envOpenaiModel,
    groqModel: settings?.groqModel || envGroqModel,
  };
};

export const getAiSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOne({ key: 'global' });
    return res.json(buildAiSettingsResponse(settings));
  } catch (err) {
    return next(err);
  }
};

export const updateAiSettings = async (req, res, next) => {
  try {
    const { aiProvider, openaiModel, groqModel } = req.body || {};

    if (aiProvider && !['openai', 'groq'].includes(aiProvider)) {
      return res.status(400).json({ message: 'Invalid AI provider' });
    }

    const settings =
      (await SystemSettings.findOne({ key: 'global' })) || new SystemSettings({ key: 'global' });

    if (aiProvider) settings.aiProvider = aiProvider;
    if (openaiModel) settings.openaiModel = openaiModel;
    if (groqModel) settings.groqModel = groqModel;

    await settings.save();
    return res.json(buildAiSettingsResponse(settings));
  } catch (err) {
    return next(err);
  }
};

export const createSubscriptionPlan = async (req, res, next) => {
  try {
    const { name, description, priceMonthly = 0, maxAiChecksPerMonth } = req.body || {};

    if (!name || typeof maxAiChecksPerMonth !== 'number' || maxAiChecksPerMonth <= 0) {
      return res
        .status(400)
        .json({ message: 'Name and a positive maxAiChecksPerMonth are required' });
    }

    const existing = await SubscriptionPlan.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Plan name already exists' });
    }

    const plan = await SubscriptionPlan.create({
      name: name.trim(),
      description,
      priceMonthly,
      maxAiChecksPerMonth,
    });

    return res.status(201).json({ plan });
  } catch (err) {
    return next(err);
  }
};

export const getSubscriptionPlans = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const plans = await SubscriptionPlan.find(filter).sort({ createdAt: -1 });
    return res.json({ count: plans.length, plans });
  } catch (err) {
    return next(err);
  }
};

export const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { name, description, priceMonthly, maxAiChecksPerMonth, isActive } = req.body || {};

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (priceMonthly !== undefined) updates.priceMonthly = priceMonthly;
    if (isActive !== undefined) updates.isActive = isActive;
    if (maxAiChecksPerMonth !== undefined) {
      if (typeof maxAiChecksPerMonth !== 'number' || maxAiChecksPerMonth <= 0) {
        return res.status(400).json({ message: 'maxAiChecksPerMonth must be positive' });
      }
      updates.maxAiChecksPerMonth = maxAiChecksPerMonth;
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.json({ plan });
  } catch (err) {
    return next(err);
  }
};

export const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.json({ message: 'Plan deactivated' });
  } catch (err) {
    return next(err);
  }
};

export const assignHospitalPlan = async (req, res, next) => {
  try {
    const { planId, maxAiChecksPerMonthOverride } = req.body || {};
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Subscription plan not found or inactive' });
    }

    hospital.subscriptionPlan = plan._id;
    hospital.planName = plan.name;
    hospital.maxAiChecksPerMonth =
      typeof maxAiChecksPerMonthOverride === 'number' && maxAiChecksPerMonthOverride > 0
        ? maxAiChecksPerMonthOverride
        : plan.maxAiChecksPerMonth;

    const now = new Date();
    if (!hospital.billingPeriodStart || !hospital.billingPeriodEnd || hospital.billingPeriodEnd < now) {
      hospital.billingPeriodStart = now;
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      hospital.billingPeriodEnd = nextMonth;
      hospital.aiChecksUsedThisMonth = 0;
    }

    await hospital.save();
    await hospital.populate('subscriptionPlan');

    return res.json({ hospital });
  } catch (err) {
    return next(err);
  }
};

