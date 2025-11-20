import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import router from './routes/routes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set a higher timeout value for the requests
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    // 5 minutes timeout
    console.log("Request has timed out.");
    res.status(408).send("Request has timed out.");
  });
  next();
});

// Routes
app.use("/api", router);

const host = "0.0.0.0"; // listen on all network interfaces

app.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
});

