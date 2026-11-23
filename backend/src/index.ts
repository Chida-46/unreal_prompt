import { app } from './app.js';
import { initDatabase } from './db/database.js';

const PORT = process.env.PORT || 5000;

// Ensure database tables exist
initDatabase();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LabLink Server running on http://localhost:${PORT}`);
  console.log(`📡 Open-Access Demo Mode: Authentication Disabled`);
  console.log(`🧠 AI Scheduling Engine: Ready (Deterministic Local Engine)`);
  console.log(`=======================================================`);
});
