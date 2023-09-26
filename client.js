//client.js

import { io } from "socket.io-client";
import readline from "readline";

const SERVER_URL = "http://localhost:3001"; 

const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

let responseBuffer = "";

socket.on("connect", () => {
  console.log("Connected to server");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt("Enter your message: ");
  rl.prompt();

  rl.on("line", async (input) => {
    if (input.trim() !== "") {
      socket.emit("message", input.trim()); 
    }
    rl.prompt();
  });

  rl.on("close", () => {
    socket.disconnect();
    process.exit(0);
  });
});

socket.on("response", (response) => {
  responseBuffer += response; // append response to buffer and add a space
  // if sentence-ending character, log and clear buffer
  if (response.endsWith('.') || response.endsWith('?') || response.endsWith('!')) {
    // trim extra spaces and log the response
    console.log(`Bot: ${responseBuffer.trim()}`);
    responseBuffer = "";
  }
});


socket.on("chatend", () => {
  console.log("\nChat session ended");
  process.stdout.write("Enter your message: ");
});

socket.on("error", (error) => {
  console.error(`\nServer error: ${error}`);
  process.stdout.write("Enter your message: ");
});

socket.on("disconnect", () => {
  console.log("\nDisconnected from chat server");
});

socket.on("connect_error", (error) => {
  console.error(`\nConnection error: ${error.message}`);
});

socket.on("connect_timeout", (timeout) => {
  console.error(`\nConnection timeout: ${timeout} ms`);
});
