import { app } from './app.js';
import { initDatabase } from './db/database.js';

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// Ensure database tables exist
initDatabase();

app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LabLink Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Open-Access Demo Mode: Authentication Disabled`);
  console.log(`🧠 AI Scheduling Engine: Ready (Deterministic Local Engine)`);
  console.log(`=======================================================`);
});
