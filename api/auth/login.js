import prisma from '../_lib/prisma.js';
import { comparePassword, signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(422).json({ error: 'Invalid input' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken(user);
    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}
