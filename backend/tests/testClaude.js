// test-claude.js
// A simple script to verify your Anthropic API key works
// and that you can get a response from Claude.
//
// Run it with:  node tests/test-claude.js

// 1. Load environment variables from the .env file
require("dotenv").config();

// 2. Import the official Anthropic SDK
const Anthropic = require("@anthropic-ai/sdk");

// 3. Read config from environment
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-7";

// 4. Safety check — stop early if the key is missing
if (!API_KEY || API_KEY === "your-anthropic-api-key-here") {
  console.error("❌  ANTHROPIC_API_KEY is not set in your .env file.");
  console.error("    Open backend/.env and replace 'your-anthropic-api-key-here' with your real key.");
  process.exit(1);
}

// 5. Create the Anthropic client
const client = new Anthropic({ apiKey: API_KEY });

// 6. The actual test — send one message and print the reply
async function testClaude() {
  console.log(`\n🚀  Testing Claude API...`);
  console.log(`    Model : ${MODEL}`);
  console.log(`    Key   : ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}\n`); // partial key for safety

  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: 256,             // keep it short for a quick test
    messages: [
      {
        role:    "user",
        content: "Say hello in one sentence and tell me which model you are. Then tell it in Moroccan Darija",
      },
    ],
  });

  // 7. Print the result
  const reply = response.content[0].text;
  console.log("✅  Claude replied:");
  console.log("─".repeat(50));
  console.log(reply);
  console.log("─".repeat(50));
  console.log("\n📊  Usage:");
  console.log(`    Input tokens  : ${response.usage.input_tokens}`);
  console.log(`    Output tokens : ${response.usage.output_tokens}`);
}

// 8. Run and catch any errors cleanly
testClaude().catch((err) => {
  console.error("❌  API call failed:", err.message);
  process.exit(1);
});
