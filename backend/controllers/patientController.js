import Report from '../models/Report.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import { generateReportPdf } from '../utils/pdfService.js';

const ensurePatientContext = (req, res) => {
  if (!req.hospital) {
    res.status(400).json({ message: 'Hospital context not found' });
    return false;
  }

  if (!req.user?.hospital || req.user.hospital.toString() !== req.hospital._id.toString()) {
    res.status(403).json({ message: 'You are not allowed to access this hospital' });
    return false;
  }

  return true;
};

const ALLOWED_GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];

const buildPatientProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  cnic: user.cnic,
});

export const getPatientProfile = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.json({ user: buildPatientProfile(user) });
  } catch (err) {
    return next(err);
  }
};

export const updatePatientProfile = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const { name, email, age, gender } = req.body || {};

    if (!name || !email || age === undefined || !gender) {
      return res
        .status(400)
        .json({ message: 'Name, email, age, and gender are required to update profile.' });
    }

    const parsedAge = Number(age);
    if (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return res.status(400).json({ message: 'Please provide a valid age between 1 and 120.' });
    }

    if (!ALLOWED_GENDERS.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender selection.' });
    }

    const existingWithEmail = await User.findOne({
      _id: { $ne: req.user._id },
      email,
      hospital: req.hospital._id,
    });
    if (existingWithEmail) {
      return res.status(400).json({ message: 'Email already in use for another patient.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.age = parsedAge;
    user.gender = gender;

    await user.save();

    return res.json({ user: buildPatientProfile(user) });
  } catch (err) {
    return next(err);
  }
};

export const updatePatientPassword = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current password and new password are required.' });
    }

    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return next(err);
  }
};

export const getPatientDashboard = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const filter = { hospital: req.hospital._id, patient: req.user._id };

    const [totalReports, latestReport] = await Promise.all([
      Report.countDocuments(filter),
      Report.findOne(filter)
        .sort({ createdAt: -1 })
        .select('summary riskLevel createdAt recommendedDoctor')
        .populate('recommendedDoctor', 'name specialization'),
    ]);

    return res.json({ totalReports, latestReport });
  } catch (err) {
    return next(err);
  }
};

export const createHealthCheckReport = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const {
      symptomInput,
      qaFlow,
      summary,
      possibleConditions,
      riskLevel = 'low',
      recommendedTests,
      dietPlan,
      whatToAvoid,
      homeCare,
      recommendedDoctorId,
      source,
      modelInfo,
    } = req.body || {};

    if (!symptomInput || !summary) {
      return res.status(400).json({ message: 'symptomInput and summary are required' });
    }

    const reportData = {
      hospital: req.hospital._id,
      patient: req.user._id,
      createdBy: req.user._id,
      symptomInput,
      qaFlow,
      summary,
      possibleConditions,
      riskLevel,
      recommendedTests,
      dietPlan,
      whatToAvoid,
      homeCare,
      source,
      modelInfo,
    };

    if (recommendedDoctorId) {
      const doctor = await Doctor.findOne({
        _id: recommendedDoctorId,
        hospital: req.hospital._id,
      });

      if (!doctor) {
        return res.status(400).json({ message: 'Invalid recommended doctor' });
      }

      // Store reference plus snapshot so future changes to the doctor do not affect this report
      reportData.recommendedDoctor = doctor._id;
      reportData.recommendedDoctorName = doctor.name;
      reportData.recommendedDoctorQualification = doctor.qualification || '';
      reportData.recommendedDoctorSpecialization = doctor.specialization || '';
    }

    const report = await Report.create(reportData);
    return res.status(201).json({ report });
  } catch (err) {
    return next(err);
  }
};

export const getHealthReports = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const filter = { hospital: req.hospital._id, patient: req.user._id };
    if (req.query.riskLevel) {
      filter.riskLevel = req.query.riskLevel;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [total, reports] = await Promise.all([
      Report.countDocuments(filter),
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'summary riskLevel createdAt recommendedDoctor recommendedDoctorName recommendedDoctorQualification recommendedDoctorSpecialization'
        )
        .populate('recommendedDoctor', 'name qualification specialization'),
    ]);

    return res.json({ total, page, limit, reports });
  } catch (err) {
    return next(err);
  }
};

export const getHealthReportById = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const report = await Report.findOne({
      _id: req.params.id,
      hospital: req.hospital._id,
      patient: req.user._id,
    }).populate('recommendedDoctor', 'name qualification specialization timings');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.json({ report });
  } catch (err) {
    return next(err);
  }
};

export const downloadHealthReportPdf = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const report = await Report.findOne({
      _id: req.params.id,
      hospital: req.hospital._id,
      patient: req.user._id,
    }).populate('recommendedDoctor', 'name qualification specialization timings');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const hospital = await Hospital.findById(req.hospital._id);
    const assistantName = hospital?.settings?.assistantName || 'HealthAI';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=health-report-${report._id}.pdf`);

    const pdfDoc = generateReportPdf({
      hospital,
      report,
      patient: req.user,
      assistantName,
    });

    pdfDoc.on('error', (err) => next(err));
    pdfDoc.pipe(res);
  } catch (err) {
    return next(err);
  }
};

