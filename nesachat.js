import OpenAI from "openai";
import colors from "colors";
import dotenv from "dotenv";
import readline from "readline";
import fs from "fs/promises";
import path from "path";

dotenv.config();

// ═══════════════════════════════════════
// OpenRouter
// ═══════════════════════════════════════

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// ═══════════════════════════════════════
// Conversation memory
// ═══════════════════════════════════════

const messages = [
  {
    role: "system",
    content:
      "You are NesaChatBot, a helpful AI coding assistant. " +
      "Be concise, practical and friendly. " +
      "When showing code, use clear formatting. " +
      "Do not unnecessarily use Markdown bold formatting."
  }
];

// ═══════════════════════════════════════
// Terminal
// ═══════════════════════════════════════

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ROOT = process.cwd();

// ═══════════════════════════════════════
// Icons
// ═══════════════════════════════════════

const ICONS = {
  bot: "🤖",
  user: "👤",
  success: "✓",
  error: "✗",
  info: "ℹ",
  file: "📄",
  folder: "📁",
  write: "✍",
  read: "📖",
  search: "🔎",
  loading: "⏳",
  rocket: "🚀",
  memory: "🧠",
  gear: "⚙",
  goodbye: "👋"
};

// ═══════════════════════════════════════
// Loading animation
// ═══════════════════════════════════════

const startLoading = () => {
  const frames = [
    "⠋ Thinking",
    "⠙ Thinking",
    "⠹ Thinking",
    "⠸ Thinking",
    "⠼ Thinking",
    "⠴ Thinking",
    "⠦ Thinking",
    "⠧ Thinking",
    "⠇ Thinking",
    "⠏ Thinking"
  ];

  let index = 0;

  process.stdout.write("\n");

  const timer = setInterval(() => {
    process.stdout.write(
      `\r${frames[index % frames.length].cyan}...`
    );

    index++;
  }, 80);

  return () => {
    clearInterval(timer);
    process.stdout.write("\r\x1b[K");
  };
};

// ═══════════════════════════════════════
// Safe file path
// ═══════════════════════════════════════

const getSafePath = (filePath) => {
  const resolved = path.resolve(ROOT, filePath);

  if (
    resolved !== ROOT &&
    !resolved.startsWith(ROOT + path.sep)
  ) {
    throw new Error("File must be inside the NesaChatBot directory.");
  }

  return resolved;
};

// ═══════════════════════════════════════
// Read file
// ═══════════════════════════════════════

const readFile = async (filePath) => {
  const safePath = getSafePath(filePath);

  const content = await fs.readFile(safePath, "utf8");

  return content;
};

// ═══════════════════════════════════════
// Write file
// ═══════════════════════════════════════

const writeFile = async (filePath, content) => {
  const safePath = getSafePath(filePath);

  await fs.mkdir(path.dirname(safePath), {
    recursive: true
  });

  await fs.writeFile(safePath, content, "utf8");
};

// ═══════════════════════════════════════
// List files
// ═══════════════════════════════════════

const listFiles = async () => {
  const files = await fs.readdir(ROOT, {
    withFileTypes: true
  });

  return files
    .filter((file) => {
      return (
        file.name !== "node_modules" &&
        file.name !== ".git" &&
        file.name !== ".env"
      );
    })
    .map((file) => {
      if (file.isDirectory()) {
        return `${ICONS.folder} ${file.name}/`;
      }

      return `${ICONS.file} ${file.name}`;
    });
};

// ═══════════════════════════════════════
// Help
// ═══════════════════════════════════════

const showHelp = () => {
  console.log();

  console.log("╭─────────────────────────────────────╮".cyan);
  console.log("│          🛠 NesaChatBot Help        │".cyan);
  console.log("╰─────────────────────────────────────╯".cyan);

  console.log();

  console.log("  /help".yellow + "              Show commands".gray);
  console.log("  /clear".yellow + "             Clear memory".gray);
  console.log("  /ls".yellow + "                List files".gray);
  console.log("  /read <file>".yellow + "       Read a file".gray);
  console.log("  /write <file>".yellow + "      Create/write a file".gray);
  console.log("  /exit".yellow + "              Exit".gray);

  console.log();
};

// ═══════════════════════════════════════
// Header
// ═══════════════════════════════════════

console.clear();

console.log();
console.log("╔══════════════════════════════════════╗".cyan);
console.log("║          🤖 NesaChatBot              ║".cyan);
console.log("║       ⚡ OpenRouter AI               ║".cyan);
console.log("║       🛠 Local File Tools            ║".cyan);
console.log("╚══════════════════════════════════════╝".cyan);
console.log();

console.log(
  `${ICONS.info} Type ${"/help".yellow} for commands`
);
console.log(
  `${ICONS.info} Type ${"/exit".yellow} to quit`
);
console.log();

// ═══════════════════════════════════════
// Main chat
// ═══════════════════════════════════════

const askQuestion = () => {
  rl.question("\n👤 You: ".green, async (input) => {
    const question = input.trim();

    if (!question) {
      askQuestion();
      return;
    }

    // ───────────────────────────────────
    // EXIT
    // ───────────────────────────────────

    if (question.toLowerCase() === "/exit") {
      console.log(
        `\n${ICONS.goodbye} Goodbye! See you next time.\n`.cyan
      );

      rl.close();
      return;
    }

    // ───────────────────────────────────
    // HELP
    // ───────────────────────────────────

    if (question.toLowerCase() === "/help") {
      showHelp();
      askQuestion();
      return;
    }

    // ───────────────────────────────────
    // CLEAR
    // ───────────────────────────────────

    if (question.toLowerCase() === "/clear") {
      messages.length = 1;

      console.log(
        `\n${ICONS.success} Conversation memory cleared.\n`
          .yellow
      );

      askQuestion();
      return;
    }

    // ───────────────────────────────────
    // LIST FILES
    // ───────────────────────────────────

    if (question.toLowerCase() === "/ls") {
      try {
        const files = await listFiles();

        console.log("\n📁 Project files:\n".cyan);

        for (const file of files) {
          console.log(`  ${file}`);
        }

        console.log();
      } catch (error) {
        console.log(
          `\n${ICONS.error} ${error.message}\n`.red
        );
      }

      askQuestion();
      return;
    }

    // ───────────────────────────────────
    // READ FILE
    // ───────────────────────────────────

    if (question.startsWith("/read ")) {
      const filePath = question.slice(6).trim();

      if (!filePath) {
        console.log(
          `\n${ICONS.error} Usage: /read <file>\n`.red
        );

        askQuestion();
        return;
      }

      try {
        const content = await readFile(filePath);

        console.log();
        console.log(
          `${ICONS.read} ${filePath}`.cyan
        );
        console.log("────────────────────────────────────".gray);
        console.log(content);
        console.log("────────────────────────────────────".gray);
        console.log();
      } catch (error) {
        console.log(
          `\n${ICONS.error} ${error.message}\n`.red
        );
      }

      askQuestion();
      return;
    }

    // ───────────────────────────────────
    // WRITE FILE
    // ───────────────────────────────────

    if (question.startsWith("/write ")) {
      const filePath = question.slice(7).trim();

      if (!filePath) {
        console.log(
          `\n${ICONS.error} Usage: /write <file>\n`.red
        );

        askQuestion();
        return;
      }

      console.log(
        `\n${ICONS.write} Enter file content.`
          .cyan
      );

      console.log(
        "Type END on a new line when finished.\n"
          .gray
      );

      const lines = [];

      const collectLines = () => {
        rl.question("", async (line) => {
          if (line === "END") {
            try {
              await writeFile(
                filePath,
                lines.join("\n")
              );

              console.log(
                `\n${ICONS.success} File written: ${filePath}\n`
                  .green
              );
            } catch (error) {
              console.log(
                `\n${ICONS.error} ${error.message}\n`
                  .red
              );
            }

            askQuestion();
            return;
          }

          lines.push(line);
          collectLines();
        });
      };

      collectLines();
      return;
    }

    // ───────────────────────────────────
    // CHAT
    // ───────────────────────────────────

    messages.push({
      role: "user",
      content: question
    });

    let stopLoading;

    try {
      stopLoading = startLoading();

      const stream = await client.chat.completions.create({
        model: "openrouter/free",
        messages,
        stream: true
      });

      stopLoading();

      process.stdout.write(
        "\r🤖 NesaBot: ".cyan
      );

      let answer = "";

      for await (const chunk of stream) {
        const content =
          chunk.choices[0]?.delta?.content || "";

        if (content) {
          process.stdout.write(content);
          answer += content;
        }
      }

      messages.push({
        role: "assistant",
        content: answer
      });

      console.log();

    } catch (error) {
      if (stopLoading) {
        stopLoading();
      }

      messages.pop();

      console.log();

      if (error.status === 401) {
        console.log(
          `${ICONS.error} Invalid OpenRouter API key.`
            .red
        );
      } else if (error.status === 429) {
        console.log(
          `${ICONS.error} OpenRouter rate limit reached.`
            .red
        );
      } else {
        console.log(
          `${ICONS.error} ${error.message}`.red
        );
      }
    }

    askQuestion();
  });
};

// ═══════════════════════════════════════
// Ctrl+C
// ═══════════════════════════════════════

rl.on("SIGINT", () => {
  console.log(
    `\n\n${ICONS.goodbye} Goodbye!\n`.cyan
  );

  rl.close();
});

// Start
askQuestion();