import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Standard Middleware untuk parsing JSON
app.use(express.json());

// Sleek dark-mode dashboard at root page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Catat Digital API Dashboard</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-dark: #090a0f;
          --panel-dark: #12141c;
          --primary: #6366f1;
          --primary-hover: #4f46e5;
          --success: #10b981;
          --text-main: #f3f4f6;
          --text-muted: #9ca3af;
          --border: rgba(255, 255, 255, 0.06);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg-dark);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-x: hidden;
          position: relative;
        }

        /* Abstract glowing blobs for premium design */
        .blob {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
          top: -100px;
          right: -100px;
          z-index: 1;
        }

        .blob-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%);
          bottom: -200px;
          left: -200px;
          z-index: 1;
        }

        .container {
          position: relative;
          z-index: 2;
          width: 90%;
          max-width: 680px;
          background: rgba(18, 20, 28, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
          margin-bottom: 30px;
        }

        .brand h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .brand p {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--success);
          padding: 6px 14px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 13px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background-color: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--success);
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 16px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }

        .card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(255, 255, 255, 0.03);
          transform: translateY(-2px);
        }

        .card-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .card-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-main);
        }

        .endpoints-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .endpoint-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 20px;
          transition: all 0.2s ease;
        }

        .endpoint-row:hover {
          background: rgba(99, 102, 241, 0.04);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .endpoint-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .method-badge {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .endpoint-path {
          font-family: monospace;
          font-size: 14px;
          color: var(--text-main);
        }

        .endpoint-btn {
          color: var(--primary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .endpoint-btn:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }

        @media (max-width: 600px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .container {
            padding: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="blob"></div>
      <div class="blob-2"></div>

      <div class="container">
        <header>
          <div class="brand">
            <h1>Catat Digital API</h1>
            <p>Production Ready Server</p>
          </div>
          <div class="status-badge">
            <span class="status-dot"></span>
            ONLINE
          </div>
        </header>

        <main>
          <h2 class="section-title">System Status</h2>
          <div class="grid">
            <div class="card">
              <div class="card-label">Runtime</div>
              <div class="card-value">Node.js (ES Modules)</div>
            </div>
            <div class="card">
              <div class="card-label">Framework</div>
              <div class="card-value">Express.js</div>
            </div>
            <div class="card">
              <div class="card-label">Package Manager</div>
              <div class="card-value">pnpm</div>
            </div>
            <div class="card">
              <div class="card-label">Environment</div>
              <div class="card-value">Development</div>
            </div>
          </div>

          <h2 class="section-title">Available Routes</h2>
          <div class="endpoints-list">
            <div class="endpoint-row">
              <div class="endpoint-info">
                <span class="method-badge">GET</span>
                <span class="endpoint-path">/</span>
              </div>
              <span style="color: var(--text-muted); font-size: 13px;">API Dashboard (This page)</span>
            </div>
            <div class="endpoint-row">
              <div class="endpoint-info">
                <span class="method-badge">GET</span>
                <span class="endpoint-path">/api/health</span>
              </div>
              <a href="/api/health" class="endpoint-btn" target="_blank">Test Endpoint →</a>
            </div>
          </div>
        </main>

        <footer>
          &copy; ${new Date().getFullYear()} Catat Digital. Sleekly deployed & running beautifully.
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running beautifully on http://localhost:${PORT}\n`);
});
