import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import hospitalAdminRoutes from "./routes/hospitalAdminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { tenantResolver } from "./middleware/tenantMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

const app = express();
await connectDB();

// Core middlewares
// Allow localhost and subdomain.localhost for multi-tenant development
// Core middlewares

const allowedOrigins = [
  process.env.FRONTEND_URL, // https://predoctorai.online
  "http://localhost:5173",
  "http://localhost:5174",
  "https://predoctorai.netlify.app", // optional, agar kahin use ho raha ho
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman etc.)
    if (!origin) return callback(null, true);

    // Explicit allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow ALL https subdomains of predoctorai.online
    // e.g. https://dhq.predoctorai.online, https://alshifa.predoctorai.online
    const subdomainPattern = /^https:\/\/[a-z0-9-]+\.predoctorai\.online$/i;
    if (subdomainPattern.test(origin)) {
      return callback(null, true);
    }

    // Baaki sab block
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: false, // tum axios me withCredentials use nahi kar rahe, is liye false hi theek hai
};

app.use(cors(corsOptions));
// Preflight (OPTIONS) requests ke liye:
app.options("*", cors(corsOptions));

app.use(express.json());

// Tenant context middleware
app.use(tenantResolver);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/super", superAdminRoutes);
app.use("/api/hospital", hospitalAdminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/ai", aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
