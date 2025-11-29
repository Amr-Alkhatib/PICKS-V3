import prisma from '../../_lib/prisma.js';
import { requireUser } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    return listSimulations(req, res, user);
  }
  if (req.method === 'POST') {
    return createSimulation(req, res, user);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function listSimulations(req, res, user) {
  const perPage = clampInt(req.query.per_page, 15, 1, 100);
  const page = clampInt(req.query.page, 1, 1, 100000);
  const sortKey = normalizeSort(req.query.sort_by);
  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  const skip = (page - 1) * perPage;

  const [items, total] = await Promise.all([
    prisma.simulation.findMany({
      where: { userId: user.id },
      orderBy: { [sortKey]: order },
      skip,
      take: perPage,
    }),
    prisma.simulation.count({ where: { userId: user.id } }),
  ]);

  res.status(200).json({
    data: items,
    meta: {
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    },
  });
}

async function createSimulation(req, res, user) {
  const { name, description, configuration, results, notes } = req.body || {};
  if (!configuration || typeof configuration !== 'object') {
    res.status(422).json({ error: 'configuration is required and must be an object' });
    return;
  }

  const simulation = await prisma.simulation.create({
    data: {
      userId: user.id,
      name: name || `Simulation ${new Date().toISOString()}`,
      description: description || null,
      configuration,
      results: results || null,
      notes: notes || null,
    },
  });

  res.status(201).json({
    message: 'Simulation saved successfully',
    simulation,
  });
}

function clampInt(value, fallback, min, max) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeSort(raw) {
  if (raw === 'created_at') return 'createdAt';
  if (raw === 'updated_at') return 'updatedAt';
  if (raw === 'name') return 'name';
  return 'createdAt';
}
