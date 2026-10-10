import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import {
  initDatabase,
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  createApplication,
  getApplications,
  updateApplicationStatus,
  getStats,
  db
} from './server/db.ts';

const app = express();
// Enable 'trust proxy' for reverse proxy environments (Nginx, Cloud Run)
app.set('trust proxy', 1);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';
const startTime = Date.now();

// 1. Security Headers via Helmet (Configured for iFrame embedding in Google AI Studio preview)
app.use(
  helmet({
    // Disable frameguard to avoid X-Frame-Options: SAMEORIGIN blocking AI Studio preview iframes
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "ws:", "wss:", "*"],
        frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app", "*"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

// Explicitly ensure X-Frame-Options is removed so preview iframes never get blocked
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Frame-Options');
  next();
});

// 2. CORS configuration (Permissive for same-origin and cloud run reverse proxies)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Request Body Size Limiting (Prevents DOS payload attacks)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Rate Limiting (Configured with validate options for reverse-proxied Cloud Run environments)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    default: false,
  },
  message: {
    error: 'Too many requests from this IP address. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

const applicationSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 applications per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    default: false,
  },
  message: {
    error: 'Application submission rate limit reached. Please wait before submitting more applications.',
    code: 'SUBMISSION_LIMIT_EXCEEDED'
  }
});

app.use('/api', apiLimiter);

// 5. Structured Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqStart = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - reqStart;
    const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
    console.log(
      `${statusColor} [${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
});

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dbCheckStart = Date.now();
    await db.execute('SELECT 1 as ping');
    const dbLatency = Date.now() - dbCheckStart;

    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const memory = process.memoryUsage();

    res.json({
      status: 'healthy',
      version: '1.0.0',
      service: 'EdVyro Internship Portal Backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      database: {
        status: 'connected',
        latencyMs: dbLatency,
        engine: 'SQLite / LibSQL'
      },
      system: {
        nodeVersion: process.version,
        memoryRssMb: Math.round(memory.rss / 1024 / 1024),
        memoryHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024)
      },
      security: {
        helmetActive: true,
        rateLimitingActive: true,
        bodyLimit: '1mb',
      }
    });
  } catch (err: any) {
    console.error('[HEALTH CHECK ERROR]', err);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: err.message
    });
  }
});

// Platform Statistics
app.get('/api/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/internships (List with search, category, work_type, status filtering)
app.get('/api/internships', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, work_type, status } = req.query;
    const internships = await getInternships({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      work_type: typeof work_type === 'string' ? work_type : undefined,
      status: typeof status === 'string' ? status : undefined,
    });

    res.json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/internships/:id (Detail view)
app.get('/api/internships/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid internship ID parameter' });
    }

    const internship = await getInternshipById(id);
    if (!internship) {
      return res.status(404).json({ error: `Internship with ID ${id} not found` });
    }

    res.json({ success: true, data: internship });
  } catch (err) {
    next(err);
  }
});

// POST /api/internships (Create new internship role)
app.post('/api/internships', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      company,
      location,
      work_type,
      category,
      stipend,
      duration,
      description,
      requirements,
      skills,
      deadline
    } = req.body;

    const validationErrors: string[] = [];

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      validationErrors.push('Title must be at least 3 characters long');
    }
    if (!company || typeof company !== 'string' || company.trim().length < 2) {
      validationErrors.push('Company name is required');
    }
    if (!location || typeof location !== 'string') {
      validationErrors.push('Location is required');
    }
    const validWorkTypes = ['Remote', 'On-site', 'Hybrid'];
    if (!validWorkTypes.includes(work_type)) {
      validationErrors.push(`Work type must be one of: ${validWorkTypes.join(', ')}`);
    }
    const validCategories = ['Engineering', 'Design', 'Product', 'Data & AI', 'Cloud & DevOps', 'Cybersecurity'];
    if (!validCategories.includes(category)) {
      validationErrors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }
    if (!stipend || typeof stipend !== 'string') {
      validationErrors.push('Stipend information is required');
    }
    if (!duration || typeof duration !== 'string') {
      validationErrors.push('Duration is required');
    }
    if (!description || typeof description !== 'string' || description.trim().length < 15) {
      validationErrors.push('Description must be at least 15 characters long');
    }
    if (!deadline || typeof deadline !== 'string') {
      validationErrors.push('Application deadline date is required');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === 'string'
      ? requirements.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Bachelor or Master student in a related discipline'];

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : ['Communication', 'Teamwork'];

    const created = await createInternship({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      work_type,
      category,
      stipend: stipend.trim(),
      duration: duration.trim(),
      description: description.trim(),
      requirements: parsedRequirements,
      skills: parsedSkills,
      deadline: deadline.trim(),
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Internship role created successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/internships/:id (Update internship)
app.put('/api/internships/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid internship ID parameter' });
    }

    const existing = await getInternshipById(id);
    if (!existing) {
      return res.status(404).json({ error: `Internship with ID ${id} not found` });
    }

    const updated = await updateInternship(id, req.body);
    res.json({
      success: true,
      message: 'Internship updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/internships/:id (Delete internship)
app.delete('/api/internships/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid internship ID parameter' });
    }

    const deleted = await deleteInternship(id);
    if (!deleted) {
      return res.status(404).json({ error: `Internship with ID ${id} not found` });
    }

    res.json({
      success: true,
      message: `Internship ${id} deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/applications (Apply for an internship)
app.post('/api/applications', applicationSubmissionLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      internship_id,
      full_name,
      email,
      phone,
      college,
      graduation_year,
      resume_url,
      cover_letter
    } = req.body;

    const validationErrors: string[] = [];

    // Verify internship exists
    const intId = parseInt(internship_id, 10);
    if (isNaN(intId) || intId <= 0) {
      validationErrors.push('Valid internship_id is required');
    } else {
      const internship = await getInternshipById(intId);
      if (!internship) {
        validationErrors.push(`Internship with ID ${intId} does not exist`);
      } else if (internship.status === 'Closed') {
        validationErrors.push('This internship position is currently closed to new applications');
      }
    }

    // Name validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      validationErrors.push('Full name must be at least 2 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      validationErrors.push('A valid email address is required');
    }

    // Phone validation
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      validationErrors.push('A valid contact phone number is required (at least 7 digits)');
    }

    // College validation
    if (!college || typeof college !== 'string' || college.trim().length < 2) {
      validationErrors.push('College or University name is required');
    }

    // Graduation year validation
    const gradYear = parseInt(graduation_year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(gradYear) || gradYear < currentYear - 5 || gradYear > currentYear + 8) {
      validationErrors.push(`Graduation year must be between ${currentYear - 5} and ${currentYear + 8}`);
    }

    // Resume URL / Link validation
    if (!resume_url || typeof resume_url !== 'string' || resume_url.trim().length < 5) {
      validationErrors.push('A link to your resume or portfolio (URL or drive link) is required');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Application validation failed',
        details: validationErrors
      });
    }

    const application = await createApplication({
      internship_id: intId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      college: college.trim(),
      graduation_year: gradYear,
      resume_url: resume_url.trim(),
      cover_letter: cover_letter ? cover_letter.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Your submission is recorded in the persistent database.',
      data: application
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications (List all or filter by internship_id or email)
app.get('/api/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { internship_id, email } = req.query;
    const filterId = internship_id ? parseInt(internship_id as string, 10) : undefined;
    const filterEmail = typeof email === 'string' ? email : undefined;

    const applications = await getApplications({
      internship_id: filterId,
      email: filterEmail
    });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications/track (Candidate status tracking by email)
app.get('/api/applications/track', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email query parameter is required to track applications' });
    }

    const applications = await getApplications({ email: email.trim() });
    res.json({
      success: true,
      email: email.trim(),
      count: applications.length,
      data: applications
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/applications/:id/status (Update applicant status)
app.patch('/api/applications/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid application ID parameter' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status field is required' });
    }

    const updated = await updateApplicationStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: `Application with ID ${id} not found` });
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: updated
    });
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid status')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// 404 handler for missing API endpoints
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: `API route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND'
  });
});

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: isProduction ? 'An unexpected server error occurred' : err.message || 'Server error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS HOSTING
// ==========================================
async function startServer() {
  // Initialize SQLite database tables and seed data
  try {
    await initDatabase();
  } catch (dbErr) {
    console.error('Failed to initialize SQLite database:', dbErr);
  }

  if (!isProduction) {
    // Development mode: Hook Vite middleware for instant updates and module resolution
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[DEV] Vite dev middleware attached to Express');
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('[PROD] Serving production static files from dist');
    } else {
      console.warn('[PROD] dist directory not found. Please build the frontend first via npm run build');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EdVyro Internship Portal server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🩺 Health check ready at http://localhost:${PORT}/api/health`);
    console.log(`💼 API ready at http://localhost:${PORT}/api/internships`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

export { app };
