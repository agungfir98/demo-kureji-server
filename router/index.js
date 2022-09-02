import express from "express";
const router = express.Router();
import {
  OrgDetail,
  CreateOrganization,
  AddMember,
} from "../controller/organization.controler.js";

import {
  AddEvent,
  GetEvent,
  EditEvent,
  HandleVote,
  StartEvent,
} from "../controller/voteEvent.controller.js";

import {
  RegisterUser,
  LoginUser,
  GetUser,
  GetUsers,
  LogoutUser,
  GetUserOrg,
  searchUser,
} from "../controller/user.controller.js";
import { runAuth } from "../middleware/index.js";
import { refreshToken } from "../controller/refreshToken.controller.js";
import { resetPassword } from "../controller/resetPassword.controller.js";

router.get("/", (req, res) => res.send("haloo"));
router.post("/register_user", RegisterUser);
router.post("/login", LoginUser);
router.post("/create_organization", runAuth, CreateOrganization);

router.post("/refresh_token", refreshToken);

router.post("/search_user", runAuth, searchUser);
router.get("/user", runAuth, GetUser);
router.get("/users", runAuth, GetUsers);

router.get("/org", runAuth, GetUserOrg);
router.get("/org/:orgId", runAuth, OrgDetail);
router.put("/org/:orgId", runAuth, AddMember);
router.post("/org/:orgId/add_event", runAuth, AddEvent);
router.get("/org/:orgId/event/:eventId", runAuth, GetEvent);
router.put("/org/:orgId/event/:eventId", runAuth, EditEvent);
router.put("/org/:orgId/event/:eventId/start", runAuth, StartEvent);

router.post("/user", LoginUser);

router.put("/vote/:eventId", runAuth, HandleVote);

router.post("/reset_password", resetPassword);
router.post("/logout", LogoutUser);

export default router;
