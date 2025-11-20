import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import WebSocket, { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";

import { emitQR, emitClientReady } from '../logDashboard.js';


const { Client, MessageMedia, LocalAuth } = pkg;

let client; // Declare client globally

// const client = new Client();
const wss = new WebSocketServer({ port: 8080 }); // WebSocket server

const statusFilePath = path.resolve("helper/status.json"); 
const disconnectFilePath = path.resolve("helper/disconnectStatus.json");

// Ensure helper folder exists
const ensureDirectoryExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Read status.json safely
const readStatus = () => {
  try {
    ensureDirectoryExists(statusFilePath);

    if (!fs.existsSync(statusFilePath)) {
      fs.writeFileSync(statusFilePath, JSON.stringify({ qr: null, clientReady: false }));
    }

    const data = fs.readFileSync(statusFilePath);
    return JSON.parse(data);
  } catch (error) {
    return { qr: null, clientReady: false };
  }
};

// Utility function to write to status.json
const writeStatus = (status) => {
  ensureDirectoryExists(statusFilePath);

  fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
};

// Utility function to write the disconnect status
const writeDisconnectStatus = (status) => {
  ensureDirectoryExists(disconnectFilePath);

  fs.writeFileSync(
    disconnectFilePath,
    JSON.stringify({ disconnected: status }, null, 2)
  );
};

let { qr, clientReady } = readStatus(); // Load the saved status on startup

// Connect websocket with frontend
wss.on("connection", (ws) => {
  console.log("New client connected via Web Sockets");
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ qr, clientReady }));
    }
  });
});

const initializeClient = () => {
  writeStatus({ qr: null, clientReady: false }); // Reset the status

  // Create the client instance
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "main", // unique id, can be anything
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // --- inside client.on("qr") ---
  client.on("qr", (qrCode) => {
    console.log("📱 QR Code received! Scan this in your terminal:\n");
    qrcode.generate(qrCode, { small: true });

    console.log("\nOr scan via browser link:");
    console.log(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=300x300`);

    qr = qrCode;
    clientReady = false;
    writeStatus({ qr: qrCode, clientReady });

    wss.clients.forEach((wsClient) => {
      if (wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify({ qr: qrCode, clientReady }));
      }
    });

    emitQR(qrCode);
  });

  // --- inside client.on("ready") ---
  client.on("ready", () => {
    console.log("Client is ready!");
    clientReady = true;
    writeStatus({ qr, clientReady });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ clientReady }));
      }
    });

    emitClientReady(true);
  });

  // --- inside client.on("disconnected") ---
  client.on("disconnected", async (reason) => {
    console.log("Client is disconnected: ", reason);
    qr = null;
    clientReady = false;
    writeStatus({ qr, clientReady });

    emitClientReady(false);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ qr, clientReady, disconnected: true }));
      }
    });

    writeDisconnectStatus(true);
  });

  // Initialize client
  client.initialize().catch((error) => {
    console.error("Failed to initialize WhatsApp client:", error);
  });
};


// Start the client
initializeClient();

// // Start the client
// client.initialize();

// Send message on WhatsApp
export const sendMessage = async (phoneNumber, msg) => {
  const countryCode = "91";
  const chatId = `${countryCode}${phoneNumber}@c.us`;

  try {
    await client.sendMessage(chatId, msg);
    return { status: "success", message: "Message sent successfully!" };
    // return "delivered"
  } catch (error) {
    console.error("Error sending message:", error);
    return { status: "error", message: "Failed to send message." };
  }
};

export const sendMessageMarketing = async (phoneNumber, msg) => {
  const countryCode = "91";
  const chatId = `${countryCode}${phoneNumber}@c.us`;

  try {
    // Load image (qr-code.png)
    const media = MessageMedia.fromFilePath(
      path.resolve("controllers/qr-code.png")
    );

    // Send image with caption (your message)
    await client.sendMessage(chatId, media, { caption: msg });

    // return { status: "success", message: "Message with image sent successfully!" };
    return "sent"

  } catch (error) {
    console.error("Error sending message with image:", error);
    return { status: "error", message: "Failed to send message with image." };
  }
};


// Check client status
export const checkClientStatus = () => {
  const { qr, clientReady } = readStatus(); // Read the latest status from file
  return { qr, clientReady };
};
