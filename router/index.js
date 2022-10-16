import express from "express";
import multer from "multer";
import path from "path";
const router = express.Router();

import {
  OrgDetail,
  CreateOrganization,
  AddMember,
  DeleteOrg,
  AddAdmin,
  RemoveAdmin,
  RemoveMember,
} from "../controller/organization.controler.js";

import {
  AddEvent,
  GetEvent,
  EditEvent,
  HandleVote,
  StartEvent,
  EditCandidate,
  getSingleCandidate,
} from "../controller/voteEvent.controller.js";

import {
  RegisterUser,
  LoginUser,
  GetUser,
  GetUsers,
  LogoutUser,
  GetUserOrg,
  searchUser,
  DeleteUser,
} from "../controller/user.controller.js";
import { runAuth } from "../middleware/index.js";
import { refreshToken } from "../controller/refreshToken.controller.js";
import { resetPassword } from "../controller/resetPassword.controller.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/candidates");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => res.send("haloo"));
router.post("/register_user", RegisterUser);
router.post("/login", LoginUser);
router.post("/create_organization", runAuth, CreateOrganization);

router.post("/refresh_token", refreshToken);

router.post("/search_user", runAuth, searchUser);
router.get("/user", runAuth, GetUser);
router.get("/users", runAuth, GetUsers);
router.delete("/user/:userId", runAuth, DeleteUser);

router.get("/org", runAuth, GetUserOrg);
router.get("/org/:orgId", runAuth, OrgDetail);
router.put("/org/:orgId", runAuth, AddMember);
router.put("/org/:orgId/add_admin", runAuth, AddAdmin);
router.put("/org/:orgId/remove_admin", runAuth, RemoveAdmin);
router.put("/org/:orgId/remove_member", runAuth, RemoveMember);
router.post("/org/:orgId/add_event", runAuth, AddEvent);
router.get("/org/:orgId/event/:eventId", runAuth, GetEvent);
router.put("/org/:orgId/event/:eventId", runAuth, EditEvent);
router.put("/org/:orgId/event/:eventId/start", runAuth, StartEvent);
router.delete("/org/:orgId", runAuth, DeleteOrg);
router.get(
  "/org/:orgId/event/:eventId/:candidateId",
  runAuth,
  getSingleCandidate
);
router.put(
  "/org/:orgId/event/:eventId/update/:candidateId",
  runAuth,
  upload.single("avatar"),
  EditCandidate
);

router.post("/user", LoginUser);

router.put("/vote/:eventId", runAuth, HandleVote);

router.post("/reset_password", resetPassword);
router.post("/logout", LogoutUser);

export default router;
