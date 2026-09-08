import OpenAI from "openai";
import colors from "colors";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

// OpenRouter client
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// Conversation memory
const messages = [
  {
    role: "system",
    content:
      "You are NesaChatBot, a helpful, friendly, intelligent AI assistant. " +
      "Give clear and concise answers. Avoid unnecessary Markdown formatting. " +
      "Do not use bold markers such as **text** unless absolutely necessary."
  }
];

// Terminal interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ─────────────────────────────────────
// UI
// ─────────────────────────────────────

console.clear();

console.log();
console.log("╔══════════════════════════════════════╗".cyan);
console.log("║          🤖 NesaChatBot              ║".cyan);
console.log("║       Powered by OpenRouter           ║".cyan);
console.log("╚══════════════════════════════════════╝".cyan);
console.log();

console.log("  /help  ".yellow + "Show commands".gray);
console.log("  /clear ".yellow + "Clear conversation".gray);
console.log("  /exit  ".yellow + "Exit NesaChatBot".gray);
console.log();

// ─────────────────────────────────────
// Clean Markdown
// ─────────────────────────────────────

const cleanMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
};

// ─────────────────────────────────────
// Ask question
// ─────────────────────────────────────

const askQuestion = () => {
  rl.question("\nYou: ".green, async (input) => {
    const question = input.trim();

    // Empty input
    if (!question) {
      askQuestion();
      return;
    }

    // Exit
    if (question.toLowerCase() === "/exit") {
      console.log("\nGoodbye! 👋\n".cyan);
      rl.close();
      return;
    }

    // Clear conversation
    if (question.toLowerCase() === "/clear") {
      messages.length = 1;

      console.log("\n✓ Conversation cleared.\n".yellow);

      askQuestion();
      return;
    }

    // Help
    if (question.toLowerCase() === "/help") {
      console.log();
      console.log("Available commands:".cyan);
      console.log("  /help  ".yellow + "Show this help message");
      console.log("  /clear ".yellow + "Clear conversation memory");
      console.log("  /exit  ".yellow + "Exit NesaChatBot");
      console.log();

      askQuestion();
      return;
    }

    // Add user message to memory
    messages.push({
      role: "user",
      content: question
    });

    try {
      process.stdout.write("\nNesaBot: ".cyan);

      // Streaming request
      const stream = await client.chat.completions.create({
        model: "openrouter/free",
        messages,
        stream: true
      });

      let answer = "";

      // Receive streamed response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";

        if (content) {
          process.stdout.write(content);
          answer += content;
        }
      }

      // Clean the final response
      const cleanedAnswer = cleanMarkdown(answer);

      // Move cursor up and rewrite the response cleanly
      const lines = answer.split("\n").length;

      if (cleanedAnswer !== answer) {
        process.stdout.write(
          "\r" +
          " ".repeat(Math.max(answer.length, cleanedAnswer.length)) +
          "\r"
        );

        process.stdout.write(cleanedAnswer);
      }

      console.log("\n");

      // Save assistant response
      messages.push({
        role: "assistant",
        content: cleanedAnswer
      });

    } catch (error) {
      console.log();

      if (error.status === 429) {
        console.log("✗ Rate limit reached.".red);
        console.log(
          "OpenRouter free models have usage limits. Try again later.".gray
        );
      } else if (error.status === 401) {
        console.log("✗ Invalid OpenRouter API key.".red);
      } else {
        console.log("✗ Error: ".red + error.message);
      }

      // Remove failed user message
      messages.pop();
    }

    askQuestion();
  });
};

// ─────────────────────────────────────
// Ctrl+C
// ─────────────────────────────────────

rl.on("SIGINT", () => {
  console.log("\n\nGoodbye! 👋\n".cyan);
  rl.close();
});

// Start
askQuestion();