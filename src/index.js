// @ts-nocheck

const express = require("express");
const mongoose = require("mongoose");
const Router = require("./Router");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const app = express();
require("dotenv").config();




/**
 * @file index.js is the hompage for this application
 * @author Vitaliy Kalachev
 * @see <a href="https://vitaliykalachev.github.io/">CV Profile</a>
 * @see <a href="https://github.com/vitaliykalachev">Github</a>
 */
app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "https://auth-todo-list-eight.vercel.app",
      "https://auth-todo-list-vitaliykalachev.vercel.app/",
      "https://auth-todo-list-fawn.vercel.app"
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("This is a sample test app");
});

app.use(express.json());
app.use("/auth", Router);

const start = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
      // "mongodb+srv://vitaliy:Password123@cluster0.2txctsn.mongodb.net/?retryWrites=true&w=majority"
    );
    app.listen(PORT, () => console.log("server started on port " + PORT));
  } catch (e) {
    console.log(e);
  }
};

start();
