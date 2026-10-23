require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌙 Noor Serverless API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Landing page: http://localhost:${PORT}/`);
  console.log(`===============================================`);
});
