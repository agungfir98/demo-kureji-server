import { isUserTheAdmin } from "../middleware/index.js";
import Organization from "../model/organization.model.js";
import User from "../model/user.model.js";
import VoteEvent from "../model/voteEvent.model.js";
import { isAdmin } from "../utils/index.js";

const CreateOrganization = async (req, res) => {
  const { orgName, description } = req.body;

  const userId = req.user.id;

  const isOrgExist = await Organization.findOne({
    organization: orgName,
  });

  if (isOrgExist)
    return res.status(400).send("organisasi sudah pernah terdaftar.");

  const newOrg = new Organization({
    organization: orgName,
    description,
    admin: [userId],
    members: [userId],
  });

  newOrg
    .save()
    .then((result) => {
      return User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            organization: result._id,
          },
        },
        { new: true }
      ).populate({
        path: "organization",
        model: "Organization",
        populate: {
          path: "admin members",
          model: "User",
          select: "email name _id",
        },
      });
    })
    .then((result) => {
      res.status(200).json({
        status: "success",
        result: result.organization,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        msg: err,
      });
    });
};

const GetOrg = async (req, res) => {
  const getAll = await Organization.find({});
  return res.send(getAll);
};

const OrgDetail = async (req, res) => {
  const { orgId } = req.params;
  const { id: userId } = req.user;

  await Organization.findById(orgId)
    .populate({
      path: "admin members",
      model: "User",
      select: "name email",
    })
    .populate({
      path: "voteEvents",
      select: "voteTitle isActive",
    })
    .then((result) => {
      const data = {
        _id: result.id,
        organization: result.organization,
        description: result.description,
        admin: result.admin,
        members: result.members.map((member) => {
          return {
            _id: member.id,
            email: member.email,
            name: member.name,
            isAdmin: isAdmin(result.admin, member.id),
          };
        }),
        voteEvents: result.voteEvents,
      };

      return res.status(200).json({
        status: "success",
        userId,
        isAdmin: isAdmin(result.admin, userId),
        result: data,
      });
    })
    .catch((err) => {
      return res.status(404).json({
        status: "error",
        err,
      });
    });
};

const AddMember = async (req, res) => {
  const { id } = req.body;
  const { orgId } = req.params;
  const { id: userId } = req.user;

  isUserTheAdmin(orgId, userId)
    .then(() => {
      return Organization.findByIdAndUpdate(
        orgId,
        { $addToSet: { members: id } },
        { new: true }
      ).populate("members admin voteEvents", "name email voteTitle");
    })
    .then(async (result) => {
      await User.findByIdAndUpdate(id, {
        $addToSet: { organization: orgId },
      });
      const data = {
        _id: result.id,
        organization: result.organization,
        description: result.description,
        admin: result.admin,
        members: result.members.map((member) => {
          return {
            _id: member.id,
            email: member.email,
            name: member.name,
            isAdmin: isAdmin(result.admin, member.id),
          };
        }),
        voteEvents: result.voteEvents,
      };
      return res.status(200).json({
        status: "success",
        userId,
        isAdmin: isAdmin(result.admin, userId),
        result: data,
      });
    })
    .catch((err) => {
      return res.status(500).json({ status: "error", msg: err.message });
    });
};

const DeleteOrg = async (req, res) => {
  const { id: userId } = req.user;
  const { orgId } = req.params;

  isUserTheAdmin(orgId, userId)
    .then((result) => {
      return Organization.findByIdAndDelete(orgId);
    })
    .then(async (result) => {
      await VoteEvent.deleteMany({ id: { $in: result.voteEvents } });
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        status: "error",
        err,
      });
    });
};

const AddAdmin = async (req, res) => {
  const { id: userId } = req.user;
  const { orgId } = req.params;
  const { id: memberId } = req.body;

  isUserTheAdmin(orgId, userId)
    .then(() => {
      return Organization.findByIdAndUpdate(
        orgId,
        { $addToSet: { admin: memberId } },
        { new: true }
      ).populate("members admin voteEvents", "name email voteTitle isActive");
    })
    .then((result) => {
      const data = {
        _id: result.id,
        organization: result.organization,
        description: result.description,
        admin: result.admin,
        members: result.members.map((member) => {
          return {
            _id: member.id,
            email: member.email,
            name: member.name,
            isAdmin: isAdmin(result.admin, member.id),
          };
        }),
        voteEvents: result.voteEvents,
      };
      res.status(200).json({
        status: "success",
        userId,
        isAdmin: isAdmin(result.admin, userId),
        result: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        err,
      });
    });
};

const RemoveAdmin = async (req, res) => {
  const { id: userId } = req.user;
  const { orgId } = req.params;
  const { id: memberId } = req.body;

  isUserTheAdmin(orgId, userId)
    .then(() => {
      return Organization.findByIdAndUpdate(
        orgId,
        { $pull: { admin: memberId } },
        { new: true }
      ).populate("members admin voteEvents", "name email voteTitle isActive");
    })
    .then((result) => {
      const data = {
        _id: result.id,
        organization: result.organization,
        description: result.description,
        admin: result.admin,
        members: result.members.map((member) => {
          return {
            _id: member.id,
            email: member.email,
            name: member.name,
            isAdmin: isAdmin(result.admin, member.id),
          };
        }),
        voteEvents: result.voteEvents,
      };
      res.status(200).json({
        status: "success",
        userId,
        isAdmin: isAdmin(result.admin, userId),
        result: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        err,
      });
    });
};

const RemoveMember = async (req, res) => {
  const { id: userId } = req.user;
  const { orgId } = req.params;
  const { id: memberId } = req.body;

  isUserTheAdmin(orgId, userId)
    .then(() => {
      return Organization.findByIdAndUpdate(
        orgId,
        { $pull: { members: memberId } },
        { new: true }
      ).populate("members admin voteEvents", "name email voteTitle isActive");
    })
    .then((result) => {
      const data = {
        _id: result.id,
        organization: result.organization,
        description: result.description,
        admin: result.admin,
        members: result.members.map((member) => {
          return {
            _id: member.id,
            email: member.email,
            name: member.name,
            isAdmin: isAdmin(result.admin, member.id),
          };
        }),
        voteEvents: result.voteEvents,
      };
      res.status(200).json({
        status: "success",
        userId,
        isAdmin: isAdmin(result.admin, userId),
        result: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        err,
      });
    });
};

export {
  CreateOrganization,
  OrgDetail,
  GetOrg,
  AddMember,
  DeleteOrg,
  AddAdmin,
  RemoveAdmin,
  RemoveMember,
};
