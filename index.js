import express from "express";
const app = express();
import bodyParser from "body-parser";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import useRouter from "./router/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const { PORT, ORIGIN } = process.env;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cookieParser());
app.use(
  cors({
    origin: [ORIGIN, "http://localhost:5173"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_DB_CONNECT)
  .then((res) => console.log("Databse berhasil terhubung"))
  .catch((e) => console.log(e));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", useRouter);

app.listen(PORT, () => {
  console.log("app running at PORT: " + PORT);
});
