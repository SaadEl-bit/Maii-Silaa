// scripts/testWhatsApp.js
/**
 * Test script: Send a single WhatsApp message via AiSensy API
 * Run: node scripts/testWhatsApp.js
 */

require('dotenv').config({ path: '../.env' });

const AISENSY_API_KEY = process.env.AISENSY_API_KEY;
const TEST_PHONE = process.env.TEST_PHONE; // Your number with country code, e.g., "+2126XXXXXXXX"

async function sendTestMessage() {
  if (!AISENSY_API_KEY) {
    console.error('❌ Missing AISENSY_API_KEY in .env');
    process.exit(1);
  }

  if (!TEST_PHONE) {
    console.error('❌ Missing TEST_PHONE in .env (format: +2126XXXXXXXX)');
    process.exit(1);
  }

  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: "filaha_test", // You may need to create this campaign in AiSensy dashboard first
    destination: TEST_PHONE,
    userName: "Filaha Test",
    templateParams: ["Test message from Filaha platform"],
    source: "filaha_backend",
    media: {
      url: "", // Leave empty for text-only
      filename: ""
    },
    buttons: [],
    carouselCards: [],
    location: {},
    paramsFallbackValue: {}
  };

  try {
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('✅ AiSensy Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendTestMessage();