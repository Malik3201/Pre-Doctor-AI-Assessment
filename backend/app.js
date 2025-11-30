import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import hospitalAdminRoutes from "./routes/hospitalAdminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { tenantResolver } from "./middleware/tenantMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

const app = express();

try {
  await connectDB();
} catch (err) {
  console.error("Initial MongoDB connection failed:", err.message);
}

// CORS configuration to allow root domain and all subdomains
const corsOptions = {
  origin: (origin, callback) => {
    // Log for debugging
    console.log('🔍 CORS check - Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ CORS: Allowing localhost origin');
      return callback(null, true);
    }

    // Allow root domain and all subdomains of predoctorai.online
    const allowedPatterns = [
      /^https?:\/\/predoctorai\.online$/,
      /^https?:\/\/.*\.predoctorai\.online$/,
      /^https?:\/\/pre-doctor-ai-assessment\.vercel\.app$/,
    ];

    const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      console.log(`✅ CORS: Allowing origin: ${origin}`);
      // Explicitly return the origin to ensure correct CORS header
      callback(null, origin);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain'],
  exposedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Manual CORS header override to ensure correct origin is set (runs after cors middleware)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Log for debugging
  if (origin) {
    console.log('🔍 Manual CORS middleware - Origin:', origin, 'Referer:', referer);
  }
  
  // If origin matches allowed patterns, set it explicitly (this overrides cors middleware if needed)
  if (origin) {
    const allowedPatterns = [
      /^https?:\/\/predoctorai\.online$/,
      /^https?:\/\/.*\.predoctorai\.online$/,
      /^https?:\/\/pre-doctor-ai-assessment\.vercel\.app$/,
    ];
    
    const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin)) ||
                      origin.includes('localhost') ||
                      origin.includes('127.0.0.1');
    
    if (isAllowed) {
      // Explicitly set the origin from the request header (not from any other source)
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Subdomain');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
      console.log(`✅ Manual CORS: Set Access-Control-Allow-Origin to: ${origin}`);
    } else {
      console.warn(`❌ Manual CORS: Origin not allowed: ${origin}`);
    }
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// Tenant context middleware must run before public & protected routes
app.use(tenantResolver);

// Public, unauthenticated hospital site routes
app.use("/api/public", publicRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Protected routes
app.use("/api/auth", authRoutes);
app.use("/api/super", superAdminRoutes);
app.use("/api/hospital", hospitalAdminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/ai", aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
