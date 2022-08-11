import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_DB_CONNECT)
  .then((res) => console.log("Databse berhasil terhubung"))
  .catch((e) => console.log(e));

import useRouter from "./router/index.js";

app.use(bodyParser.json());

app.use("/", useRouter);

const { PORT } = process.env;
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
