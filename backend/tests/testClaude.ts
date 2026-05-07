import Anthropic from "@anthropic-ai/sdk";

async function main() {
  const anthropic = new Anthropic();

  const msg = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content:
          "confirm for me that you are working say it moroccan darija , arabic , frensh and english"
      }
    ]
  });
  console.log(msg);
}

main().catch(console.error);