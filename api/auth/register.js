import prisma from '../_lib/prisma.js';
import { hashPassword, signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, password, password_confirmation, tum_id } = req.body || {};

  if (!name || !email || !password || password !== password_confirmation) {
    res.status(422).json({ error: 'Invalid input' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(422).json({ error: 'Email already in use' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        tumId: tum_id || null,
        isTumVerified: false,
      },
    });

    const token = signToken(user);
    res.status(201).json({
      message: 'User registered successfully',
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
