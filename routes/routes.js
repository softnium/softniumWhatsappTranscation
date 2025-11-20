import express from "express";
import {
  checkClientStatus,
  sendMessage,
} from "../controllers/whatsappWebController.js";
const router = express.Router();

router.post("/send-message", async (req, res) => {
  const { phoneNumber, msg } = req.body;
  try {
    const result = await sendMessage(phoneNumber, msg);
    res.status(200).json(result); // Send the result back as a JSON response
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Failed to send message");
  }
});

router.get("/client-status", (req, res) => {
  try {
    const result = checkClientStatus();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching client status:", error);
    res.status(500).send("Failed to fetch client status");
  }
});

export default router;
