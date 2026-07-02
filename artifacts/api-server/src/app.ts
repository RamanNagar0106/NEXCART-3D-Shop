import express, { Request, Response } from "express";
import pinoHttp from "pino-http";

const app = express();

// Middleware
app.use(pinoHttp());
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running 🚀");
});

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ success: true });
});

// ✅ IMPORTANT: EXPORT DEFAULT
export default app;
