// --------------- The following code requires Chrome to be opened in debug mode. It detects / opens WhatsApp web in the existing Chrome instance and sends a message. ---------------

// import puppeteer from "puppeteer";
// import dotenv from "dotenv";
// import fetch from "node-fetch";

// dotenv.config();

// // Polyfill fetch
// globalThis.fetch = fetch;

// const sendMessage = async (phoneNumber, msg) => {
//   // Connect to the existing Chrome instance
//   const browser = await puppeteer.connect({
//     browserURL: "http://localhost:9222", // URL of the remote debugging port
//   });

//   const pages = await browser.pages();
//   let page = pages.find((p) => p.url().includes("web.whatsapp.com"));

//   if (!page) {
//     console.log("WhatsApp Web is not open, navigating to WhatsApp Web...");
//     page = await browser.newPage();
//     await page.goto(process.env.WHATSAPP_WEB_URL || "https://web.whatsapp.com");
//   } else {
//     console.log("WhatsApp Web is already open!");
//   }

//   // Check if WhatsApp Web is logged in by waiting for the QR code to appear
//   const qrSelector = "canvas"; // QR code canvas element selector
//   const isLoggedIn = await page.waitForSelector(qrSelector, {
//     timeout: 360000,
//   }); // Check if QR code is present, wait for 1 minute

//   if (isLoggedIn) {
//     // If QR code exists, WhatsApp Web is not logged in
//     console.log("WhatsApp Web is not logged in.");
//     const response = { login: false, message: "WhatsApp Web is not logged in" };
//     await browser.disconnect();
//     return response;
//   }

//   // Navigate to the specific chat
//   console.log("Logged in. Navigating to chat...");
//   await page.goto(`https://web.whatsapp.com/send?phone=${phoneNumber}`);

//   try {
//     // Wait for the message input box to appear
//     await page.waitForSelector("._ak1r", { timeout: 60000 }); // Selector for div that contains the selectable-text

//     console.log("Sending message...");
//     await page.type("._ak1r", msg); // Type the message

//     // Simulate pressing 'Enter' to send the message
//     await page.keyboard.press("Enter", { timeout: 3000 });

//     console.log("Message sent successfully!");
//     return { login: true, message: "Message sent successfully!" };
//   } catch (error) {
//     console.error("Error sending message:", error);
//   } finally {
//     // Optionally close the browser connection or keep it open
//     await browser.disconnect(); // Disconnect from the existing browser
//   }
// };

// export default sendMessage;

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// --------------- The below code opens WhatsApp Web in a new window and waits for the QR code to be scanned. ---------------

// import puppeteer from "puppeteer";
// import dotenv from "dotenv";

// dotenv.config();

// const sendMessage = async (phoneNumber, message) => {
//   const browser = await puppeteer.launch({
//     headless: false, // Set to true for production
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();
//   await page.goto(process.env.WHATSAPP_WEB_URL);

//   try {
//     console.log("Waiting for QR scan...");
//     await page.waitForSelector(".x9f619", { timeout: 120000 }); // Wait up to 2 minutes
//     console.log("Logged in successfully!");
//   } catch (error) {
//     console.log(
//       "Login failed or took too long. Please scan the QR code within 2 minutes."
//     );
//     await browser.close();
//     return;
//   }

//   console.log("Navigating to chat...");
//   await page.goto(`https://web.whatsapp.com/send?phone=${phoneNumber}`);
//   await page.waitForSelector("._ak1l", { timeout: 60000 }); // Wait for message input

//   console.log("Sending message...");
//   await page.type("._ak1l", message);
//   // await page.click('button[aria-label="Send"]');
//   // Simulate pressing 'Enter' to send the message
//   await page.keyboard.press("Enter");

//   console.log("Message sent successfully!");
// };
// export default sendMessage;

// --------------------------------------------------------------------------------------------------------------------------

// --------------- The below code opens Whatsapp Desktop, goes to the chat, types the message and waits for the user to press Enter key to send the message ---------------

// import open from "open";

// const sendMessage = async (phoneNumber, message) => {
//   // Construct the WhatsApp URL scheme with the phone number and message
//   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//     message
//   )}`;

//   try {
//     // Open WhatsApp using the URL
//     console.log(`Opening WhatsApp with URL: ${whatsappUrl}`);
//     await open(whatsappUrl); // This will open the installed WhatsApp Desktop app

//     console.log(
//       "WhatsApp Desktop should now open with the message pre-filled."
//     );

//   } catch (error) {
//     console.error("Failed to open WhatsApp Desktop:", error);
//   }
// };

// export default sendMessage;

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
