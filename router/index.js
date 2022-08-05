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
} from "../controller/voteEvent.controller.js";

import {
  RegisterUser,
  LoginUser,
  GetUser,
  GetUsers,
} from "../controller/user.controller.js";
import { AuthAdmin, runAuth } from "../middleware/index.js";

router.post("/register_user", RegisterUser);
router.post("/login", LoginUser);
router.post("/create_organization", runAuth, CreateOrganization);

router.get("/user/:id", GetUser);
router.get("/users", GetUsers);

router.get("/org", GetOrg);
router.get("/org/:orgId", OrgDetail);
router.post("/org/:orgId/add_event", runAuth, AddEvent);
router.get("/org/:orgId/events/:eventId", GetEvent);
router.put("/org/:orgId/events/:eventId", AuthAdmin, EditEvent);

router.post("/user", LoginUser);

export default router;
