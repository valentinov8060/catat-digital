# Catat Digital Backend 🚀

The backend application for **CatatDigital**, built on top of **Node.js, Express, and TypeScript**. It integrates the official **Gemini 2.0 Flash** service to automatically process and audit financial records for MSMEs using images of physical receipts, invoices, or cash books.

## 🛠️ Tech Stack & Architecture

- **Runtime & Language:** Node.js, TypeScript (ES2022)
- **Framework & Router:** Express
- **Architectural Pattern:** 3-Tier Architecture (Routes, Controllers, Services)
- **AI Integration:** Official `@google/genai` SDK (Model: `gemini-2.0-flash`)
- **API Documentation:** Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **File Upload:** Multer (Memory Storage)
- **Developer Tools:** `tsx` for fast hot-reloading in local development environments

---

## 📂 Project Structure

```bash
catat-digital-backend/
├── src/
│   ├── controllers/      # Entry/exit gates for handling HTTP requests & responses
│   │   └── audit-catatan-controller.ts
│   ├── middleware/       # Supporting middleware (e.g., Multer file upload)
│   │   └── multer-middleware.ts
│   ├── routes/           # Centralized API routing
│   │   ├── index.ts      # Master router
│   │   └── audit-catatan-route.ts
│   ├── services/         # Core business logic (Gemini AI integration)
│   │   └── audit-catatan-service.ts
│   ├── utils/            # Helper utilities (Structured Logger)
│   │   └── logger.ts
│   └── index.ts          # Main entry point of the Express application
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Before running the application, ensure you have the following installed on your local machine:

- Node.js (v18 or newer is highly recommended)
- pnpm (or npm)

---

## 🚀 Getting Started

1. Clone the Repository & Navigate to the Directory

```bash
git clone [https://github.com/valentinov8060/catat-digital-backend.git](https://github.com/valentinov8060/catat-digital-backend.git)
cd catat-digital-backend
```

2. Install Dependencies
   Use pnpm (or npm):

```Bash
pnpm install
# or
npm install
```

3. Configure Environment Variables
   Copy the template .env.example file to create your own configuration file named .env:

```Bash
cp .env.example .env
```

Open the .env file and insert your Gemini API Key:

```bash
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the Application in Development Mode
   Start the development server with instant hot-reloading (powered by tsx):

```Bash
pnpm run dev
# or
npm run dev
```

The server will be up and running at http://localhost:3000.

---

## 📖 API Documentation & Playground (Swagger UI)

This application comes integrated with an interactive Swagger UI. Once the server is running, open your web browser and navigate to the following link:
👉 http://localhost:3000/api-docs

---

## 📦 Production Build

To compile the TypeScript source files into pure JavaScript before deploying the application to a production server:

```Bash
# 1. Compile TypeScript source code into the /dist directory
pnpm run build
# 2. Run the compiled JavaScript production build
pnpm run start
```
