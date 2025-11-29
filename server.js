import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import register from './api/auth/register.js';
import login from './api/auth/login.js';
import logout from './api/auth/logout.js';
import me from './api/auth/me.js';
import simulations from './api/simulations/index.js';
import simulationById from './api/simulations/[id].js';
import bulkDelete from './api/simulations/bulk-delete.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowlist = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowlist.length ? allowlist : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

const wrap = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
    next(error);
  }
};

const withIdParam = (handler) => async (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  return handler(req, res);
};

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', wrap(register));
app.post('/api/auth/login', wrap(login));
app.post('/api/auth/logout', wrap(logout));
app.get('/api/auth/me', wrap(me));

app.get('/api/simulations', wrap(simulations));
app.post('/api/simulations', wrap(simulations));
app.get('/api/simulations/:id', wrap(withIdParam(simulationById)));
app.put('/api/simulations/:id', wrap(withIdParam(simulationById)));
app.delete('/api/simulations/:id', wrap(withIdParam(simulationById)));
app.post('/api/simulations/bulk-delete', wrap(bulkDelete));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
