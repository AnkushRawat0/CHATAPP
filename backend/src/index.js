import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const app = express();
app.use(cors({
  origin : "http://localhost:5173" ,
  credentials : true ,
}))

app.use(express.json());
app.use(cookieParser()) ; 

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
  connectDB();
});
