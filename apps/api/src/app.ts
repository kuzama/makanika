import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import mechanicRoutes from './routes/mechanic.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import searchRoutes from './routes/search.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api', reviewRoutes);
app.use('/api', adminRoutes);
app.use('/api/search', searchRoutes);

export default app;
