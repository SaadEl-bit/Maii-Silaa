const { buildIrrigationPrompt } = require('../utils/promptBuilder');

const contextData = {
  crop: 'tomato',
  stage: 'initial',
  country: 'MA',
  weather: { temp: 20, humidity: 50, wind: 2, rain: 0, solar: 20 },
  etResult: { eto: 3.5, etc: 2.1, shouldIrrigate: false, waterMm: 0, waterHours: 0 }
};

// 1. Call the function exactly how aiTranslator.js calls it
const result = buildIrrigationPrompt(contextData);

console.log('--- WHAT THE FUNCTION RETURNS ---');
console.log('Data Type:', typeof result);
console.log('Value starts with:', result.slice(0, 100) + '...\n');

// 2. Try to destructure it, just like line 78 in aiTranslator.js does
const { systemPrompt, userPrompt } = buildIrrigationPrompt(contextData);

console.log('--- WHAT HAPPENS ON LINE 78 ---');
console.log('systemPrompt:', systemPrompt);
console.log('userPrompt:', userPrompt);
