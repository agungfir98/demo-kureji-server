import express from "express";
const app = express();
import bodyParser from "body-parser";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import useRouter from "./router/index.js";
const { PORT, ORIGIN } = process.env;

app.use(cookieParser());
app.use(
  cors({
    origin: ORIGIN,
    credentials: false,
  })
);

mongoose
  .connect(process.env.MONGO_DB_CONNECT)
  .then((res) => console.log("Databse berhasil terhubung"))
  .catch((e) => console.log(e));

app.use(bodyParser.json());

app.use("/", useRouter);

app.listen(PORT, () => {
  console.log("app running at PORT: " + PORT);
});
