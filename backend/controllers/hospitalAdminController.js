import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import AiUsageLog from '../models/AiUsageLog.js';
import { mergePublicSiteConfig } from '../utils/publicSiteConfig.js';

const ensureHospitalContext = (req, res) => {
  if (!req.hospital) {
    res.status(400).json({ message: 'Hospital context not found' });
    return false;
  }

  if (!req.user?.hospital || req.user.hospital.toString() !== req.hospital._id.toString()) {
    res.status(403).json({ message: 'You are not allowed to manage this hospital' });
    return false;
  }

  return true;
};

export const getHospitalSettings = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const hospital = await Hospital.findById(req.hospital._id);
    return res.json({ hospital });
  } catch (err) {
    return next(err);
  }
};

export const updateHospitalSettings = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const currentSettings = req.hospital.settings || {};

    const updates = {};
    const allowedRootFields = ['name', 'logo', 'primaryColor', 'secondaryColor'];

    allowedRootFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.settings) {
      const settingsFields = [
        'emergencyText',
        'aiInstructions',
        'assistantName',
        'assistantTone',
        'assistantLanguage',
        'assistantIntroTemplate',
        'extraStyleInstructions',
        'appointmentWhatsApp',
        'tagline',
        'city',
        'country',
      ];
      
      // Use dot notation for nested settings to properly merge
      settingsFields.forEach((field) => {
        if (req.body.settings[field] !== undefined) {
          updates[`settings.${field}`] = req.body.settings[field];
        }
      });

      if (req.body.settings.enabledFeatures) {
        updates['settings.enabledFeatures'] = {
          dietPlan:
            req.body.settings.enabledFeatures.dietPlan !== undefined
              ? req.body.settings.enabledFeatures.dietPlan
              : currentSettings.enabledFeatures?.dietPlan,
          testSuggestions:
            req.body.settings.enabledFeatures.testSuggestions !== undefined
              ? req.body.settings.enabledFeatures.testSuggestions
              : currentSettings.enabledFeatures?.testSuggestions,
          doctorRecommendation:
            req.body.settings.enabledFeatures.doctorRecommendation !== undefined
              ? req.body.settings.enabledFeatures.doctorRecommendation
              : currentSettings.enabledFeatures?.doctorRecommendation,
        };
      }

      if (Array.isArray(req.body.settings.faqs)) {
        updates['settings.faqs'] = req.body.settings.faqs;
      }
    }

    const hospital = await Hospital.findByIdAndUpdate(req.hospital._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({ hospital });
  } catch (err) {
    return next(err);
  }
};

const PUBLIC_SITE_LIMITS = {
  highlightStats: 4,
  services: 8,
  faqItems: 8,
  doctorsHighlightDoctorIds: 4,
};

const SERVICE_ICON_OPTIONS = new Set([
  'cardiology',
  'surgery',
  'emergency',
  'pediatrics',
  'diagnostics',
  'radiology',
  'orthopedics',
  'primary-care',
  'telemedicine',
]);

const sanitizeString = (value, maxLength = 500) => {
  if (typeof value !== 'string') return undefined;
  return value.trim().slice(0, maxLength);
};

const sanitizeArray = (value, limit, mapper) => {
  if (!Array.isArray(value)) return undefined;
  return value
    .slice(0, limit)
    .map(mapper)
    .filter(Boolean);
};

const sanitizePublicSitePayload = (body = {}) => {
  const payload = {};
  const booleanFields = [
    'isEnabled',
    'showLoginButton',
    'showPatientRegisterButton',
    'showAiBanner',
    'showDoctorsHighlight',
    'showFaq',
    'showContact',
  ];
  booleanFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = Boolean(body[field]);
    }
  });

  const shortTextFields = [
    ['heroTitle', 160],
    ['heroSubtitle', 320],
    ['heroTagline', 160],
    ['heroImageUrl', 600],
    ['aboutHeading', 120],
    ['servicesHeading', 120],
    ['aiBannerTitle', 160],
    ['doctorsHighlightHeading', 160],
    ['faqHeading', 160],
    ['contactHeading', 160],
    ['contactPhone', 64],
    ['contactEmail', 160],
    ['contactAddress', 320],
    ['mapEmbedUrl', 800],
  ];

  shortTextFields.forEach(([field, length]) => {
    if (body[field] !== undefined) {
      payload[field] = sanitizeString(body[field], length) || '';
    }
  });

  if (body.aboutBody !== undefined) {
    payload.aboutBody = sanitizeString(body.aboutBody, 2000) || '';
  }

  if (body.aiBannerText !== undefined) {
    payload.aiBannerText = sanitizeString(body.aiBannerText, 1000) || '';
  }

  if (body.highlightStats !== undefined) {
    payload.highlightStats = sanitizeArray(body.highlightStats, PUBLIC_SITE_LIMITS.highlightStats, (item) => {
      const label = sanitizeString(item?.label, 80) || '';
      const value = sanitizeString(item?.value, 40) || '';
      if (!label && !value) {
        return null;
      }
      return { label, value };
    }) ?? [];
  }

  if (body.services !== undefined) {
    payload.services =
      sanitizeArray(body.services, PUBLIC_SITE_LIMITS.services, (item) => {
        const title = sanitizeString(item?.title, 80) || '';
        const description = sanitizeString(item?.description, 240) || '';
        const iconKeyRaw = sanitizeString(item?.iconKey, 40) || '';
        const iconKey = SERVICE_ICON_OPTIONS.has(iconKeyRaw) ? iconKeyRaw : '';
        if (!title && !description) {
          return null;
        }
        return { title, description, iconKey };
      }) ?? [];
  }

  if (body.faqItems !== undefined) {
    payload.faqItems =
      sanitizeArray(body.faqItems, PUBLIC_SITE_LIMITS.faqItems, (item) => {
        const question = sanitizeString(item?.question, 200) || '';
        const answer = sanitizeString(item?.answer, 800) || '';
        if (!question && !answer) {
          return null;
        }
        return { question, answer };
      }) ?? [];
  }

  if (body.doctorsHighlightDoctorIds !== undefined) {
    if (Array.isArray(body.doctorsHighlightDoctorIds)) {
      const seen = new Set();
      const ids = [];
      for (const id of body.doctorsHighlightDoctorIds) {
        if (ids.length >= PUBLIC_SITE_LIMITS.doctorsHighlightDoctorIds) break;
        if (typeof id !== 'string') continue;
        const trimmed = id.trim();
        if (!mongoose.Types.ObjectId.isValid(trimmed)) continue;
        if (seen.has(trimmed)) continue;
        seen.add(trimmed);
        ids.push(trimmed);
      }
      payload.doctorsHighlightDoctorIds = ids;
    } else {
      payload.doctorsHighlightDoctorIds = [];
    }
  }

  return payload;
};

export const getPublicSiteConfig = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const hospital = await Hospital.findById(req.hospital._id).select('name logo subdomain publicSite');

    // Convert Mongoose subdocument to plain object if needed
    const rawPublicSite = hospital?.publicSite;
    const plainPublicSite = rawPublicSite && typeof rawPublicSite.toObject === 'function' 
      ? rawPublicSite.toObject() 
      : (rawPublicSite || {});

    return res.json({
      hospital: {
        name: hospital?.name,
        logo: hospital?.logo,
        subdomain: hospital?.subdomain,
      },
      publicSite: mergePublicSiteConfig(plainPublicSite),
    });
  } catch (err) {
    return next(err);
  }
};

export const updatePublicSiteConfig = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const hospital = await Hospital.findById(req.hospital._id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const sanitizedPayload = sanitizePublicSitePayload(req.body || {});
    const currentConfig = hospital.publicSite || {};
    const updatedConfig = { ...currentConfig, ...sanitizedPayload };

    if (sanitizedPayload.highlightStats !== undefined) {
      updatedConfig.highlightStats = sanitizedPayload.highlightStats;
    }
    if (sanitizedPayload.services !== undefined) {
      updatedConfig.services = sanitizedPayload.services;
    }
    if (sanitizedPayload.faqItems !== undefined) {
      updatedConfig.faqItems = sanitizedPayload.faqItems;
    }
    if (sanitizedPayload.doctorsHighlightDoctorIds !== undefined) {
      updatedConfig.doctorsHighlightDoctorIds = sanitizedPayload.doctorsHighlightDoctorIds;
    }

    hospital.publicSite = updatedConfig;
    await hospital.save();

    // Reload to get fresh data, then convert Mongoose subdocument to plain object
    const savedHospital = await Hospital.findById(req.hospital._id).select('name logo subdomain publicSite');
    const rawPublicSite = savedHospital?.publicSite;
    const plainPublicSite = rawPublicSite && typeof rawPublicSite.toObject === 'function' 
      ? rawPublicSite.toObject() 
      : (rawPublicSite || {});

    return res.json({
      hospital: {
        name: savedHospital.name,
        logo: savedHospital.logo,
        subdomain: savedHospital.subdomain,
      },
      publicSite: mergePublicSiteConfig(plainPublicSite),
    });
  } catch (err) {
    return next(err);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const {
      name,
      specialization,
      qualification,
      experienceYears,
      expertiseTags,
      timings,
      description,
      status,
    } = req.body || {};

    if (!name || !specialization) {
      return res.status(400).json({ message: 'Name and specialization are required' });
    }

    if (!qualification || !qualification.trim()) {
      return res.status(400).json({ message: 'Qualification is required' });
    }

    const doctor = await Doctor.create({
      hospital: req.hospital._id,
      name,
      specialization,
      qualification: qualification?.trim(),
      experienceYears,
      expertiseTags,
      timings,
      description,
      status,
    });

    return res.status(201).json({ doctor });
  } catch (err) {
    return next(err);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const filter = { hospital: req.hospital._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, doctors] = await Promise.all([
      Doctor.countDocuments(filter),
      Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return res.json({ total, page, limit, doctors });
  } catch (err) {
    return next(err);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const doctor = await Doctor.findOne({ _id: req.params.id, hospital: req.hospital._id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json({ doctor });
  } catch (err) {
    return next(err);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const allowedFields = [
      'name',
      'specialization',
      'qualification',
      'experienceYears',
      'expertiseTags',
      'timings',
      'description',
      'status',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, hospital: req.hospital._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json({ doctor });
  } catch (err) {
    return next(err);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, hospital: req.hospital._id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json({ message: 'Doctor removed' });
  } catch (err) {
    return next(err);
  }
};

export const getPatients = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const filter = { role: 'PATIENT', hospital: req.hospital._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, patients] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
    ]);

    return res.json({ total, page, limit, patients });
  } catch (err) {
    return next(err);
  }
};

export const togglePatientBanStatus = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const { status } = req.body || {};
    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const patient = await User.findOne({
      _id: req.params.id,
      role: 'PATIENT',
      hospital: req.hospital._id,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.status = status;
    await patient.save();

    return res.json({ message: 'Patient status updated', status: patient.status });
  } catch (err) {
    return next(err);
  }
};

export const getHospitalAnalyticsOverview = async (req, res, next) => {
  try {
    if (!ensureHospitalContext(req, res)) {
      return;
    }

    const hospitalId = req.hospital._id;
    const hospital = await Hospital.findById(hospitalId);

    const [totalDoctors, totalPatients, bannedPatients, totalReports, totalAiChecks] = await Promise.all([
      Doctor.countDocuments({ hospital: hospitalId }),
      User.countDocuments({ hospital: hospitalId, role: 'PATIENT' }),
      User.countDocuments({ hospital: hospitalId, role: 'PATIENT', status: 'banned' }),
      Report.countDocuments({ hospital: hospitalId }),
      AiUsageLog.countDocuments({ hospital: hospitalId }),
    ]);

    return res.json({
      totalDoctors,
      totalPatients,
      bannedPatients,
      totalReports,
      totalAiChecks,
      planName: hospital?.planName || 'free',
      maxAiChecksPerMonth: hospital?.maxAiChecksPerMonth || 0,
      aiChecksUsedThisMonth: hospital?.aiChecksUsedThisMonth || 0,
      billingPeriodStart: hospital?.billingPeriodStart,
      billingPeriodEnd: hospital?.billingPeriodEnd,
    });
  } catch (err) {
    return next(err);
  }
};

