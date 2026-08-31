import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import router from "./routes";
import { logger } from "./lib/logger";
import { basicSecurity } from "./middleware";

const app: Express = express();

app.disable("x-powered-by");
app.use(basicSecurity);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found.", code: "NOT_FOUND" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ error }, "Unhandled request error");
  res.status(500).json({ success: false, message: "Something went wrong. Please try again.", code: "INTERNAL_ERROR" });
});

export default app;
