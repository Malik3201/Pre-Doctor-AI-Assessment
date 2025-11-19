import Report from '../models/Report.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
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

      reportData.recommendedDoctor = doctor._id;
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
        .select('summary riskLevel createdAt recommendedDoctor')
        .populate('recommendedDoctor', 'name specialization'),
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
    }).populate('recommendedDoctor', 'name specialization timings');

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
    }).populate('recommendedDoctor', 'name specialization timings');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const hospital = await Hospital.findById(req.hospital._id);
    const assistantName = hospital?.settings?.assistantName || 'HealthAI';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=health-report-${report._id}.pdf`);

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

