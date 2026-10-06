import jwt from 'jsonwebtoken';
import dbConnect from './db';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dsatrack_super_secret_jwt_key_2026_college_tracker';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(req) {
  await dbConnect();

  let token = null;

  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check cookies if not in header
  if (!token) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((c) => {
          const [key, ...v] = c.split('=');
          return [key, decodeURIComponent(v.join('='))];
        })
      );
      token = cookies.token || cookies['dsatrack_token'];
    }
  }

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return null;
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export function isAllowedStudentEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return lower.endsWith('@mit.ac.in') || lower.endsWith('@miet.ac.in');
}

export async function generateInstructorId() {
  await dbConnect();
  const count = await User.countDocuments({ role: 'INSTRUCTOR' });
  const nextNumber = count + 1;
  const padded = String(nextNumber).padStart(3, '0');
  let candidate = `INS${padded}`;

  // Double check uniqueness
  let exists = await User.findOne({ instructorId: candidate });
  let counter = nextNumber;
  while (exists) {
    counter++;
    candidate = `INS${String(counter).padStart(3, '0')}`;
    exists = await User.findOne({ instructorId: candidate });
  }

  return candidate;
}

export function generateBatchCode(branch = 'CSE', section = 'A', year = '2026') {
  const cleanBranch = (branch || 'CSE').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
  const cleanSection = (section || 'A').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 2);
  const cleanYear = String(year || '26').slice(-2);
  const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `DSA-${cleanBranch}-${cleanSection}${cleanYear}`;
}
