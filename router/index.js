import express from "express";
const router = express.Router();
import {
  GetOrg,
  OrgDetail,
  CreateOrganization,
} from "../controller/organization.controler.js";

import {
  AddEvent,
  GetEvent,
  EditEvent,
  HandleVote,
} from "../controller/voteEvent.controller.js";

import {
  RegisterUser,
  LoginUser,
  GetUser,
  GetUsers,
  LogoutUser,
  GetUserOrg,
} from "../controller/user.controller.js";
import { AuthAdmin, runAuth } from "../middleware/index.js";
import { refreshToken } from "../controller/refreshToken.controller.js";
import { resetPassword } from "../controller/resetPassword.controller.js";

router.post("/register_user", RegisterUser);
router.post("/login", LoginUser);
router.post("/create_organization", runAuth, CreateOrganization);

router.post("/refresh_token", refreshToken);

router.get("/user", runAuth, GetUser);
router.get("/users", runAuth, GetUsers);

router.get("/org", runAuth, GetUserOrg);
router.get("/org/:orgId", OrgDetail);
router.post("/org/:orgId/add_event", runAuth, AddEvent);
router.get("/org/:orgId/events/:eventId", GetEvent);
router.put("/org/:orgId/events/:eventId", AuthAdmin, EditEvent);

router.post("/user", LoginUser);

router.put("/vote/:eventId/:candidateId", runAuth, HandleVote);

router.post("/reset_password", resetPassword);
router.post("/logout", LogoutUser);

export default router;
