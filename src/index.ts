import path from "node:path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import router from "./routes/index.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const port = (process.env.PORT || 8080) as number;

app.disable("x-powered-by");
app.set("trust proxy", false);

// CORS configuration
const options = {
  origin: process.env.URL || "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization, X-Requested-With",
  credentials: true,
};
app.use(cors(options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Static Files Setup
app.use(express.static(path.join(process.cwd(), "public")));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Catat Digital API",
      version: "1.0.0",
      description: "API Documentation for Catat Digital",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use the master router for all routes
app.use(router);

app.listen(port, "0.0.0.0", () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api-docs`);
});
