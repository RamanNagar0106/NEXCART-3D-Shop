import express, { Request, Response } from "express";
import pinoHttp from "pino-http"; // ✅ correct import

const app = express();

// ✅ FIX: handle compatibility safely
const logger = (pinoHttp as unknown as () => any)();

app.use(logger);
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running 🚀");
});

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ success: true });
});

// ✅ export default (required for index.ts)
export default app;
