const serverless = require('serverless-http');
const app = require('../src/app');

const handler = serverless(app);

// Export for Vercel
module.exports = app;

// Export for Netlify / AWS Lambda
module.exports.handler = handler;
