import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_EXPIRY = '7d';

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  return token || null;
}

export async function requireUser(req, res) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return null;
    }
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return null;
    }
    return user;
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
}
