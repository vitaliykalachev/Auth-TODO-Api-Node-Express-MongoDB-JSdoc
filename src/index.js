// @ts-check

const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./authRouter");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const app = express();

/**
 * @file index.js is the hompage for this application
 * @author Vitliy Kalachev
 * @see <a href="https://vitaliykalachev.github.io/">CV Profile</a>
 * @see <a href="https://github.com/vitaliykalachev">Github</a>
 */
app.use(cors({
  origin: ["http://localhost:5000",
   "https://auth-todo-list-eight.vercel.app",
  "https://auth-todo-list-vitaliykalachev.vercel.app/"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/auth", authRouter);



const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://vitaliy:Password123@cluster0.2txctsn.mongodb.net/?retryWrites=true&w=majority"
    );
    app.listen(PORT, () => console.log("server started on port " + PORT));
  } catch (e) {
    console.log(e);
  }
};

start();
