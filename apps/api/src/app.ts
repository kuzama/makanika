import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import mechanicRoutes from './routes/mechanic.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import searchRoutes from './routes/search.routes';
import { generalLimiter, authLimiter, searchLimiter } from './middleware/rate-limit';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check (no rate limit)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Apply rate limiters per route group
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/search', searchLimiter, searchRoutes);
app.use('/api/mechanics', generalLimiter, mechanicRoutes);
app.use('/api', generalLimiter, reviewRoutes);
app.use('/api', generalLimiter, adminRoutes);

export default app;
