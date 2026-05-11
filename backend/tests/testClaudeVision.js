/**
 * testClaudeVision.js — Claude Vision Model Test (Cheapest to Most Expensive)
 * 
 * Tests Claude models for image analysis in Arabic MSA + JSON format.
 * 
 * Price comparison (Anthropic pricing):
 *   - Haiku: $0.0008/input image (cheapest!)
 *   - Sonnet: $0.003/input image
 *   - Opus: $0.015/input image (most expensive)
 * 
 * Run: node tests/testClaudeVision.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');

// Load .env manually (force override system env vars)
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) process.env[key] = value;
  }
});

// Check API key first
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in .env');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
  console.error('❌ Invalid ANTHROPIC_API_KEY format!');
  console.error('   Current value:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');
  console.error('   Expected: starts with "sk-ant-" (100+ characters)');
  console.error('   Get key from: https://console.anthropic.com/');
  process.exit(1);
}

console.log('✅ API Key loaded:', process.env.ANTHROPIC_API_KEY.substring(0, 15) + '...');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Test image (publicly accessible crop disease photo)
const TEST_IMAGE_URL = 
  'https://static0.backyardbossimages.com/wordpress/wp-content/uploads/2022/07/Tomato-Virus-.jpg?q=50&fit=crop&w=825&dpr=1.5';
  // 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI0yoYuClnJlI6y-FjeUOEeoRaKPGDbfG6lQ&s'
  // 'https://stmaaprodfwsite.blob.core.windows.net/assets/sites/1/261017-Disease1-Eyespot-c-no-credit.jpg'

// System prompt (same as detectionService.js)
const SYSTEM_PROMPT = 
  'أنت خبير زراعي متخصص في تشخيص أمراض المحاصيل باستخدام الصور. ' +
  'حلّل الصورة المرفقة وأعطِ تشخيصًا دقيقًا بالعربية الفصحى. ' +
  'قيّم ثقتك في تشخيصك بنفسك: "confidence" يجب أن يعكس يقينك الحقيقي ' +
  '(0.0 = لا أعرف، 1.0 = متأكد تمامًا). لا تبالغ في الثقة. ' +
  'ردّ ONLY as valid JSON (no markdown fences) with this exact schema:\n' +
  '{\n' +
  '  "diagnosis": "...",\n' +
  '  "severity": "low|medium|high|critical",\n' +
  '  "treatment": "...",\n' +
  '  "confidence": 0.0-1.0,\n' +
  '  "visual_signals": ["..."],\n' +
  '  "action_items": ["..."]\n' +
  '}';

const USER_PROMPT = 'المحصول: طماطم. حلّل الصورة وأعطني التشخيص.';

// Models to test (cheapest first)
const MODELS = [
  { 
    id: 'claude-haiku-4-5-20251001', 
    name: 'Claude Haiku 4.5', 
    price: '$0.0008/img',
    tier: 'CHEAPEST'
  },
  { 
    id: 'claude-sonnet-4-6', 
    name: 'Claude Sonnet 4.6', 
    price: '$0.003/img',
    tier: 'MEDIUM'
  }
  // { 
  //   id: 'claude-3-5-sonnet-20240620', 
  //   name: 'Claude 3.5 Sonnet', 
  //   price: '$0.003/img',
  //   tier: 'MEDIUM'
  // }
];

async function testModel(modelInfo) {
  console.log(`\n⏳ Testing ${modelInfo.name} (${modelInfo.id})...`);
  console.log(`   Price: ${modelInfo.price}`);
  
  const startTime = Date.now();
  let raw = null;
  
  try {
    const response = await anthropic.messages.create({
      model: modelInfo.id,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: TEST_IMAGE_URL } },
          { type: 'text', text: SYSTEM_PROMPT + '\n\n' + USER_PROMPT }
        ]
      }]
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    raw = response.content[0]?.text;
    
    if (!raw) {
      throw new Error('Empty response');
    }

    // Parse JSON
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    
    console.log(`\n✅ SUCCESS (${elapsed}s)`);
    console.log('─'.repeat(50));
    console.log('Diagnosis:', parsed.diagnosis?.substring(0, 80));
    console.log('Severity:', parsed.severity);
    console.log('Confidence:', (parsed.confidence * 100).toFixed(0) + '%');
    console.log('Treatment:', parsed.treatment?.substring(0, 60) + '...');
    console.log('─'.repeat(50));
    
    return { success: true, model: modelInfo, elapsed, parsed };
    
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n❌ FAILED (${elapsed}s)`);
    console.log('   Error:', error.message);
    
    // If it's a JSON parse error, show the raw response
    if (raw) {
      console.log('   Raw response (first 300 chars):');
      console.log('   ' + raw.substring(0, 300));
    }
    
    return { success: false, model: modelInfo, elapsed, error: error.message, raw };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🥬 FILAHA — Claude Vision Model Test');
  console.log('='.repeat(60));
  console.log('Test image:', TEST_IMAGE_URL.substring(0, 50) + '...');
  console.log('Task: Tomato disease diagnosis in Arabic MSA + JSON\n');
  
  const results = [];
  
  for (const model of MODELS) {
    const result = await testModel(model);
    results.push(result);
    
    // Wait between tests to avoid rate limits
    if (model !== MODELS[MODELS.length - 1]) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('\n✅ Working models (sorted by speed):');
  successful.sort((a, b) => a.elapsed - b.elapsed).forEach((r, i) => {
    console.log(`   ${i+1}. ${r.model.name} - ${r.elapsed}s`);
  });
  
  if (failed.length > 0) {
    console.log('\n❌ Failed models:');
    failed.forEach(r => {
      console.log(`   - ${r.model.name}: ${r.error}`);
    });
  }
  
  console.log('\n💡 RECOMMENDATION FOR detectionService.js:');
  if (successful.length > 0) {
    console.log(`   Primary (cheapest): ${successful[0].model.id}`);
    if (successful.length > 1) {
      console.log(`   Fallback: ${successful[1].model.id}`);
    }
  } else {
    console.log('   ❌ No models worked. Check your ANTHROPIC_API_KEY!');
  }
  
  console.log('='.repeat(60));
}

main().catch(console.error);