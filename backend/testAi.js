require('dotenv').config();
const { callOpenRouter } = require('./services/aiTranslator');

callOpenRouter('system', 'user', 0.1, 1024, 'google/gemma-4-31b-it:free')
  .then(console.log)
  .catch(console.error);
