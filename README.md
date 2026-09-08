# NesaBot CLI

A simple, colorful **AI chatbot for the terminal**, powered by **OpenRouter** and built with Node.js.

NesaChatBot provides a continuous terminal conversation with streaming responses, conversation memory, and basic project file management.

## Features

* 🤖 AI-powered terminal chat
* 💬 Continuous conversations
* 🧠 Conversation history during the session
* ⚡ Streaming AI responses
* 🎨 Colored terminal interface
* 📁 Read and write project files
* 🔒 `.env` support for API keys
* 🛡️ Restricted file access to the project directory
* ❌ Simple terminal commands such as `/exit`, `/clear`, and `/help`
* 🌐 OpenRouter API support

## Tech Stack

* **Node.js**
* **OpenRouter**
* **OpenAI SDK**
* **dotenv**
* **colors**
* **readline**
* **File System API**

## Installation

Clone the repository:

```bash
git clone git@github.com:HamedProDev/nesa_chat_bot.git
cd nesa_chat_bot
```

Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Never commit your `.env` file.

Your `.gitignore` should contain:

```gitignore
.env
node_modules/
```

## Run

Start NesaChatBot with:

```bash
npm start
```

You can then chat directly from your terminal.

## Commands

| Command         | Description                |
| --------------- | -------------------------- |
| `/help`         | Show available commands    |
| `/clear`        | Clear conversation history |
| `/ls`           | List project files         |
| `/read <file>`  | Read a project file        |
| `/write <file>` | Create or overwrite a file |
| `/exit`         | Exit NesaChatBot           |

## Example

```text
┌─[hamedpro@parrot] NesaChatBot
└──╼ You: What is the capital of Rwanda?

Nesa: Kigali is the capital of Rwanda.
```

You can continue asking questions without restarting the program.

## Project Structure

```text
NesaChatBot/
├── nesachat.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env
└── README.md
```

> `.env` is local only and should never be committed to GitHub.

## Security

NesaChatBot uses an environment variable for the OpenRouter API key instead of hard-coding credentials in the source code.

File operations are restricted to the project directory to help prevent accessing files outside the chatbot's workspace.

**Never share or commit your API key.**

## Future Improvements

* 🔧 AI tool/function calling
* 🧰 More filesystem tools
* 💾 Persistent conversation memory
* 🔍 Web search
* 🖥️ Better terminal UI
* ⚙️ Custom model selection
* 🧩 Plugin/tool system

## Author

**Hamed Hussein**

GitHub: **HamedProDev**

---

⭐ If you find NesaChatBot useful, consider giving the project a star.
