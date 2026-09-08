import OpenAI from "openai";
import colors from "colors";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

const messages = [
  {
    role: "system",
    content:
      "You are NesaChatBot, a helpful, friendly, concise AI assistant."
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log();
console.log("╔══════════════════════════════════════╗".cyan);
console.log("║          🤖 NesaChatBot              ║".cyan);
console.log("║       Powered by OpenRouter           ║".cyan);
console.log("╚══════════════════════════════════════╝".cyan);
console.log();
console.log("Type".gray, "'exit'".yellow, "to quit.");
console.log("Type".gray, "'clear'".yellow, "to clear conversation.");
console.log();

const askQuestion = () => {
  rl.question("You: ".green, async (input) => {
    const question = input.trim();

    if (!question) {
      askQuestion();
      return;
    }

    if (question.toLowerCase() === "exit") {
      console.log("\nGoodbye! 👋\n".cyan);
      rl.close();
      return;
    }

    if (question.toLowerCase() === "clear") {
      messages.length = 1;
      console.log("\n✓ Conversation cleared.\n".yellow);
      askQuestion();
      return;
    }

    messages.push({
      role: "user",
      content: question
    });

    try {
      process.stdout.write("\nNesaBot: ".cyan);

      const stream = await client.chat.completions.create({
        model: "openrouter/free",
        messages,
        stream: true
      });

      let answer = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";

        if (content) {
          process.stdout.write(content);
          answer += content;
        }
      }

      console.log("\n");

      messages.push({
        role: "assistant",
        content: answer
      });

    } catch (error) {
      console.log("\n\n✗ Error: ".red + error.message.red);

      messages.pop();
    }

    askQuestion();
  });
};

askQuestion();