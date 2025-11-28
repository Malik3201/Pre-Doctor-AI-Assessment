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
await connectDB();

const corsOptions = {
  origin: true,
  credentials: false,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
