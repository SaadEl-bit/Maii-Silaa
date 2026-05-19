// testOpenRouter.js
// Simple test: send one message to OpenRouter and print the reply.
//
// Requirements: Node >= 18 (fetch built-in), dotenv (already installed)
// No extra packages needed!
//
// Run from the tests/ folder:  node testOpenRouter.js

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// ── Config from .env ──────────────────────────────────────────────────────────
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL   = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

// ── Safety check ─────────────────────────────────────────────────────────────
if (!API_KEY || API_KEY.trim() === "") {
  console.error("❌  OPENROUTER_API_KEY is not set in your backend/.env file.");
  console.error("    Get a free key at: https://openrouter.ai/keys");
  process.exit(1);
}

// ── The question we will ask ──────────────────────────────────────────────────
const USER_QUESTION = "Introduce your self in arabic MSA and give me a num/10 on (ur arabic MSA level , knoledge about crops and farms and interpretation) in english";

// ── Send the request ──────────────────────────────────────────────────────────
async function testOpenRouter() {
  console.log("\n🚀  Testing OpenRouter API...");
  console.log(`    Model : ${MODEL}`);
  console.log(`    Key   : ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}\n`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization":  `Bearer ${API_KEY}`,
      "Content-Type":   "application/json",
      // Optional but recommended by OpenRouter for attribution
      "HTTP-Referer":   process.env.OPENROUTER_SITE_URL  || "http://localhost:5173",
      "X-Title":        process.env.OPENROUTER_APP_NAME  || "Filaha",
    },
    body: JSON.stringify({
      model:MODEL,
      max_tokens: 512,
      messages: [
        {
          role:    "user",
          content: USER_QUESTION,
        },
      ],
    }),
  });

  // ── Parse and display ─────────────────────────────────────────────────────
  const data = await response.json();

  if (!response.ok) {
    console.error("❌  OpenRouter returned an error:");
    console.error("    HTTP", response.status, data.error?.message || JSON.stringify(data));
    process.exit(1);
  }

  const reply = data.choices?.[0]?.message?.content ?? "(no content)";

  console.log("✅  OpenRouter replied:");
  console.log("─".repeat(50));
  console.log(reply);
  console.log("─".repeat(50));
  console.log("\n📊  Usage:");
  console.log(`    Prompt tokens     : ${data.usage?.prompt_tokens     ?? "N/A"}`);
  console.log(`    Completion tokens : ${data.usage?.completion_tokens ?? "N/A"}`);
  console.log(`    Total tokens      : ${data.usage?.total_tokens      ?? "N/A"}`);
}

testOpenRouter().catch((err) => {
  console.error("❌  Request failed:", err.message);
  process.exit(1);
});