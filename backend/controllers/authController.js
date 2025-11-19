import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hospital: user.hospital,
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

export const registerPatient = async (req, res, next) => {
  try {
    if (!req.hospital) {
      return res.status(400).json({ message: 'Hospital context is required' });
    }

    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email, hospital: req.hospital._id });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'PATIENT',
      hospital: req.hospital._id,
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

