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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "https://predoctorai.netlify.app",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Postman / curl / server-to-server etc.
    if (!origin) return callback(null, true);

    const isExplicitAllowed = allowedOrigins.includes(origin);

    const isSubdomainAllowed =
      /^https:\/\/[a-z0-9-]+\.predoctorai\.online$/i.test(origin);

    if (isExplicitAllowed || isSubdomainAllowed) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: false,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

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
