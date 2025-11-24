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
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "https://predoctorai.netlify.app",
      ];

      // Allow localhost and any subdomain.localhost
      if (
        origin === allowedOrigin ||
        origin.match(/^http:\/\/[a-z0-9-]+\.localhost:\d+$/) ||
        origin === "http://localhost:5173"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false, // tumhare axios me withCredentials: false hai, so ok
  })
);

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
