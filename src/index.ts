import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import auditCatatanRoute from './routes/audit-catatan-route.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CatatDigital API',
      version: '1.0.0',
      description: 'API Documentation for CatatDigital Backend',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  // Path ke file yang berisi komentar JSDoc Swagger
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rute API
app.use('/api/v1/audit-catatan', auditCatatanRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.send('CatatDigital API is running. Check /api-docs for documentation.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
