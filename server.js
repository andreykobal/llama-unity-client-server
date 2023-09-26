import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://192.168.1.137:8080'
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://192.168.1.137:8080',
    methods: ['GET', 'POST']
  }
});
const PORT = 3001;

app.use(bodyParser.json());

const CHAT_APP_LOCATION = path.join(process.cwd(), "llama.cpp", "main");

const socketPrograms = new Map();

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`A user connected with ID: ${socket.id}`);

  let program = spawn(CHAT_APP_LOCATION, [
    "-m",
    path.join(
      process.cwd(),
      "llama.cpp",
      "models",
      "luna-ai-llama2-uncensored.ggmlv3.q5_1.bin"
    ),
    "-n",
    "512",
    "--repeat_penalty",
    "1.0",
    "--color",
    "-i",
    "-r",
    "User: ",
    "-p",
    "You are a helpful assistant. Answer questions and continue conversations."
  ]);

  socketPrograms.set(socket.id, program);

  setupProgramHandlers(socket, program);

  socket.on("message", (message) => {
    if (!message) {
      socket.emit("error", "Message is required.");
      return;
    }

    if (program && program.stdin) {
      program.stdin.write("User: " + message + "\n");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected with ID: ${socket.id}`);
    const program = socketPrograms.get(socket.id);
    if (program) {
      program.kill();
      socketPrograms.delete(socket.id);
    }
  });
});

function setupProgramHandlers(socket, program) {
  program.stdout.on("data", (data) => {
    const output = data.toString("utf8");
    socket.emit("response", processOutput(output));
  });

  program.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  program.on("close", (code) => {
    if (code !== 0) {
      socket.emit("error", "Failed to get response.");
    }
  });
}

let isTagOpen = false;
let closing = "";

function processOutput(output) {
  if (output.includes("<")) {
    isTagOpen = true;
  }

  if (output.includes("=>")) {
    closing = "";
  }

  if (isTagOpen) {
    closing = "";
  }

  if (output.includes(">")) {
    closing = ">";
  }

  if (output) {
    console.log(`Received from program: ${output.trim()}`);
    // Emitting the "response" event is now handled outside of this function
  } else {
    console.log("No output received from the program.");
  }

  if (closing === ">" && !isTagOpen) {
    closing = "";
    io.emit("chatend"); // If this is the end, emit a "chatend" event
    return "";
  }

  return output;
}


app.post("/llm-api/message", (req, res) => {
  io.emit("message", req.body.message);
  res.status(200).send({ message: "Message received" });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
