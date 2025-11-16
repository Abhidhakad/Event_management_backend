import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import dotenv from "dotenv";


dotenv.config();

const app = express();



// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(mongoSanitize());
// app.use(xss());

// Rate limiter
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use(limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/admin',adminRoutes);
app.use('/api/v1/bookings', bookingRoutes);


app.get('/', (req, res) => res.send('Backend is running'));
app.use((req, res) => res.status(404).json({ message: 'API endpoint not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});


export default app;
