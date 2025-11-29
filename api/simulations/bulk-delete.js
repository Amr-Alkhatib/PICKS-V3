import prisma from '../../_lib/prisma.js';
import { requireUser } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(422).json({ error: 'ids array is required' });
    return;
  }

  await prisma.simulation.deleteMany({
    where: {
      id: { in: ids.map((n) => Number(n)).filter((n) => Number.isInteger(n)) },
      userId: user.id,
    },
  });

  res.status(200).json({ message: 'Simulations deleted successfully' });
}
