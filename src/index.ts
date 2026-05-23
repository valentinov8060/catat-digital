import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import router from "./routes/index.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Catat Digital API",
      version: "1.0.0",
      description: "API Documentation for Catat Digital Backend",
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

// Root endpoint
app.get("/", (req, res) => {
  res.send("Catat Digital API is running. Check /api-docs for documentation.");
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api-docs`);
});
