import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 4004;

// Serve dashboard HTML
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// Override console.log to emit logs to dashboard
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  io.emit("log", args.join(" "));
};

// Expose function to emit QR codes
export const emitQR = (qr) => {
  io.emit("qr", qr);
};

// Optional: emit client ready status
export const emitClientReady = (ready) => {
  io.emit("clientReady", ready);
};

server.listen(PORT, () => console.log(`📊 Log dashboard running at http://localhost:${PORT}`));
