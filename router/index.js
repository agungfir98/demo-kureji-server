import express from "express";
const router = express.Router();
import {
  RegisterOrganization,
  LoginOrganization,
} from "../controller/organization.controler.js";
import { runAuth } from "../middleware/index.js";

router.post("/", LoginOrganization);
router.get("/", runAuth, (req, res) => {
  res.json({
    msg: "berhasil terotentikasi!",
    hasil: req.user,
  });
});
router.post("/daftar", RegisterOrganization);

export default router;
