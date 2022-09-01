import express from "express";
const app = express();
import bodyParser from "body-parser";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
const { PORT, ORIGIN } = process.env;

app.use(cookieParser());
app.use(
  cors({
    origin: ORIGIN,
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

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on PORT: ${PORT}`)
);
