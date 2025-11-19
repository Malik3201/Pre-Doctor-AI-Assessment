import Doctor from '../models/Doctor.js';
import Report from '../models/Report.js';
import AiUsageLog from '../models/AiUsageLog.js';
import Hospital from '../models/Hospital.js';
import { generateHealthAssessment } from '../utils/aiClient.js';
import { sendEmail } from '../utils/emailService.js';

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

export const aiHealthCheck = async (req, res, next) => {
  try {
    if (!ensurePatientContext(req, res)) {
      return;
    }

    const { symptomInput, qaFlow = [] } = req.body || {};
    if (!symptomInput) {
      return res.status(400).json({ message: 'symptomInput is required' });
    }

    const hospital = await Hospital.findById(req.hospital._id);
    if (!hospital) {
      return res.status(400).json({ message: 'Hospital context not found' });
    }

    const now = new Date();
    if (!hospital.billingPeriodStart || !hospital.billingPeriodEnd || hospital.billingPeriodEnd < now) {
      hospital.billingPeriodStart = now;
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      hospital.billingPeriodEnd = nextMonth;
      hospital.aiChecksUsedThisMonth = 0;
    }

    const maxChecks = hospital.maxAiChecksPerMonth ?? 0;
    if (maxChecks > 0 && hospital.aiChecksUsedThisMonth >= maxChecks) {
      return res.status(403).json({
        message: 'AI usage limit reached for this billing period. Please contact support.',
      });
    }

    const doctors = await Doctor.find({ hospital: hospital._id, status: 'active' }).select(
      'name specialization expertiseTags'
    );

    const { provider, model, data, usage } = await generateHealthAssessment({
      hospital,
      symptomInput,
      qaFlow,
      doctors,
    });

    const {
      assistantIntro,
      summary,
      possibleConditions,
      riskLevel,
      recommendedTests,
      dietPlan,
      whatToAvoid,
      homeCare,
      recommendedDoctorId,
      modelInfo,
    } = data;

    let recommendedDoctor = null;
    if (recommendedDoctorId) {
      recommendedDoctor = await Doctor.findOne({
        _id: recommendedDoctorId,
        hospital: hospital._id,
        status: 'active',
      }).select('_id');
    }

    const report = await Report.create({
      hospital: hospital._id,
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
      recommendedDoctor: recommendedDoctor ? recommendedDoctor._id : null,
      source: 'AI',
      modelInfo,
    });

    await AiUsageLog.create({
      hospital: hospital._id,
      user: req.user._id,
      patient: req.user._id,
      type: 'SYMPTOM_ANALYSIS',
      provider,
      model,
      tokensUsed: usage?.totalTokens || 0,
      metadata: {
        riskLevel,
        conditionsCount: Array.isArray(possibleConditions) ? possibleConditions.length : 0,
      },
    });

    hospital.aiChecksUsedThisMonth += 1;
    await hospital.save();

    try {
      if (req.user.email) {
        await sendEmail({
          to: req.user.email,
          subject: 'Your AI Health Pre-Assessment Report',
          text: `A new AI health pre-assessment report has been generated for you at ${
            hospital.name || 'your hospital'
          }. Risk level: ${riskLevel?.toUpperCase() || 'UNKNOWN'}.`,
        });
      }
    } catch (emailErr) {
      console.error('Failed to send report email:', emailErr.message);
    }

    const populatedReport = await Report.findById(report._id).populate(
      'recommendedDoctor',
      'name specialization timings'
    );

    return res.status(201).json({ assistantIntro, report: populatedReport });
  } catch (err) {
    return next(err);
  }
};

