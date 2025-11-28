import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import { mergePublicSiteConfig } from '../utils/publicSiteConfig.js';

export const getHospitalMeta = (req, res) => {
  const defaultMeta = {
    mode: 'global',
    name: 'Pre-Doctor AI',
    logo: null,
    primaryColor: '#0F62FE',
    secondaryColor: '#020617',
    tagline: 'Hospital Intelligence Suite',
  };

  const hospital = req?.hospital;
  const subdomain = req?.subdomain; // From tenantResolver middleware

  // If subdomain was provided but hospital not found, return not_found mode
  if (!hospital && subdomain) {
    return res.json({
      mode: 'not_found',
      subdomain: subdomain,
      message: 'Hospital not found',
      ...defaultMeta,
    });
  }

  // Root domain (no subdomain, no hospital)
  if (!hospital) {
    return res.json(defaultMeta);
  }

  if (hospital.status && hospital.status !== 'active') {
    return res.json({
      mode: 'inactive',
      name: hospital.name,
      subdomain: hospital.subdomain,
      status: hospital.status,
      message: 'This hospital portal is temporarily unavailable. Please contact the administrator.',
    });
  }

  return res.json({
    mode: 'hospital',
    name: hospital.name,
    subdomain: hospital.subdomain,
    logo: hospital.logo || null,
    primaryColor: hospital.primaryColor || defaultMeta.primaryColor,
    secondaryColor: hospital.secondaryColor || defaultMeta.secondaryColor,
    tagline: hospital.settings?.tagline || 'Patient pre-assessment & care coordination',
    city: hospital.settings?.city || null,
    country: hospital.settings?.country || null,
  });
};

export const getHospitalPublicSite = (req, res) => {
  const hospital = req?.hospital;

  if (!hospital || hospital.status !== 'active') {
    return res.status(404).json({ message: 'Hospital not found or inactive' });
  }

  const publicSite = mergePublicSiteConfig(hospital.publicSite);

  return res.json({
    hospital: {
      name: hospital.name,
      subdomain: hospital.subdomain,
      logo: hospital.logo || null,
      primaryColor: hospital.primaryColor || '#0F62FE',
      secondaryColor: hospital.secondaryColor || '#020617',
    },
    publicSite,
  });
};

export const getPublicHighlightDoctors = async (req, res, next) => {
  try {
    const hospital = req?.hospital;

    if (!hospital || hospital.status !== 'active') {
      return res.status(404).json({ message: 'Hospital not found or inactive' });
    }

    const idsParam = req.query?.ids;
    if (!idsParam) {
      return res.json({ doctors: [] });
    }

    const ids = Array.isArray(idsParam)
      ? idsParam
      : String(idsParam)
          .split(',')
          .map((id) => id.trim());

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (!validIds.length) {
      return res.json({ doctors: [] });
    }

    const doctors = await Doctor.find({
      _id: { $in: validIds },
      hospital: hospital._id,
      status: 'active',
    })
      .select('name specialization qualification experienceYears description expertiseTags')
      .lean();

    const sanitized = doctors.map((doctor) => ({
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experienceYears: doctor.experienceYears,
      description: doctor.description,
      expertiseTags: doctor.expertiseTags,
    }));

    return res.json({ doctors: sanitized });
  } catch (err) {
    return next(err);
  }
};

