import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hospital: user.hospital,
  age: user.age,
  gender: user.gender,
  cnic: user.cnic,
});

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account is banned' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (req.hospital && user.hospital && req.hospital._id.toString() !== user.hospital.toString()) {
      return res.status(403).json({ message: 'User does not belong to this hospital' });
    }

    const token = generateToken(user._id);
    return res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    return next(err);
  }
};

const ALLOWED_GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];

const CNIC_PATTERN = /^\d{13}$/;

export const registerPatient = async (req, res, next) => {
  try {
    if (!req.hospital) {
      return res.status(400).json({ message: 'Hospital context is required' });
    }

    const { name, email, password, age, gender, cnic } = req.body || {};

    if (!name || !email || !password || age === undefined || !gender || !cnic) {
      return res
        .status(400)
        .json({ message: 'Name, email, password, age, gender, and CNIC are required' });
    }

    const parsedAge = Number(age);
    if (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return res.status(400).json({ message: 'Please provide a valid age between 1 and 120.' });
    }

    if (!ALLOWED_GENDERS.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender selection.' });
    }

    const cleanedCnic = String(cnic).replace(/\D/g, '');
    if (!CNIC_PATTERN.test(cleanedCnic)) {
      return res.status(400).json({
        message: 'Invalid CNIC format. Please provide 13 digits (with or without dashes).',
      });
    }

    const existingUser = await User.findOne({ email, hospital: req.hospital._id });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingCnicUser = await User.findOne({ cnic: cleanedCnic, role: 'PATIENT' });
    if (existingCnicUser) {
      return res.status(400).json({ message: 'This CNIC is already registered as a patient.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'PATIENT',
      hospital: req.hospital._id,
      age: parsedAge,
      gender,
      cnic: cleanedCnic,
    });

    const token = generateToken(user._id);
    return res.status(201).json({ token, user: buildUserResponse(user) });
  } catch (err) {
    return next(err);
  }
};

export const bootstrapSuperAdmin = async (req, res, next) => {
  try {
    const existing = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existing) {
      return res.status(403).json({ message: 'Super admin already exists' });
    }

    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'SUPER_ADMIN',
      hospital: null,
    });

    const token = generateToken(user._id);
    return res.status(201).json({ token, user: buildUserResponse(user) });
  } catch (err) {
    return next(err);
  }
};

