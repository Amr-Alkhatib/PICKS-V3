import prisma from '../../_lib/prisma.js';
import { requireUser } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const id = parseInt(req.query.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  if (req.method === 'GET') {
    return showSimulation(res, user, id);
  }
  if (req.method === 'PUT') {
    return updateSimulation(req, res, user, id);
  }
  if (req.method === 'DELETE') {
    return deleteSimulation(res, user, id);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function showSimulation(res, user, id) {
  const simulation = await prisma.simulation.findFirst({
    where: { id, userId: user.id },
  });
  if (!simulation) {
    res.status(404).json({ error: 'Simulation not found' });
    return;
  }
  res.status(200).json(simulation);
}

async function updateSimulation(req, res, user, id) {
  const { name, description, configuration, results, notes } = req.body || {};
  const simulation = await prisma.simulation.findFirst({
    where: { id, userId: user.id },
  });
  if (!simulation) {
    res.status(404).json({ error: 'Simulation not found' });
    return;
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (configuration !== undefined) data.configuration = configuration;
  if (results !== undefined) data.results = results;
  if (notes !== undefined) data.notes = notes;

  const updated = await prisma.simulation.update({
    where: { id },
    data,
  });

  res.status(200).json({
    message: 'Simulation updated successfully',
    simulation: updated,
  });
}

async function deleteSimulation(res, user, id) {
  const simulation = await prisma.simulation.findFirst({
    where: { id, userId: user.id },
  });
  if (!simulation) {
    res.status(404).json({ error: 'Simulation not found' });
    return;
  }

  await prisma.simulation.delete({ where: { id } });
  res.status(200).json({ message: 'Simulation deleted successfully' });
}
