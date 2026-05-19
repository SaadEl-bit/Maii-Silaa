const aiTranslator = require('../services/aiTranslator');

async function run() {
  const context = {
    weather: {
      temp: 18.8,
      humidity: 59,
      wind: 5.4,
      rain: 0,
      solar: 425
    },
    etResult: {
      eto: 3.32,
      etc: 1.99,
      shouldIrrigate: false,
      waterMm: 2,
      waterHours: 0
    },
    crop: 'tomato',
    stage: 'initial',
    location: '33.031707, -7.617327'
  };

  console.log('🚀 Testing aiTranslator.translate() with irrigation context...');
  
  try {
    const result = await aiTranslator.translate('irrigation', context);
    console.log('\n✅ AI Translator Result:\n──────────────────────────────────────────────────');
    console.log(JSON.stringify(result, null, 2));
    console.log(`\nModel used: ${result.model}`);
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

run();
