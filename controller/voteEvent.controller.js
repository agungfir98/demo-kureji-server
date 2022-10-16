import VoteEvent from "../model/voteEvent.model.js";
import Organization from "../model/organization.model.js";
import User from "../model/user.model.js";
import { isUserTheAdmin } from "../middleware/index.js";
import { checkHasVote, isAdmin } from "../utils/index.js";
import mongoose from "mongoose";

const AddEvent = async (req, res) => {
  const { orgId } = req.params;
  const { voteTitle, candidates } = req.body;
  const isExist = await VoteEvent.findOne({ voteTitle });
  if (isExist) return res.send("udah ada");

  Organization.findById(orgId)
    .then((data) => {
      if (!data)
        return res
          .status(404)
          .json({ status: "error", msg: "Organization cannot be found" });
      return data;
    }) // check if organization exists
    .then(async (data) => {
      const registeredVoters = data.members.map((v, i) => {
        return { voter: v };
      });
      const addEvent = new VoteEvent({
        voteTitle,
        candidates,
        registeredVoters,
        holder: orgId,
      });
      return addEvent.save();
    }) // create new voteEvent instance and save
    .then((result) => {
      return Organization.findByIdAndUpdate(
        orgId,
        {
          $addToSet: { voteEvents: result.id },
        },
        { new: true }
      );
    }) // findOneandupdate, insert voteEvent to organization
    .then((result) => {
      return res.status(200).json({
        status: "success",
        result,
      });
    }) // retuern result output */
    .catch((err) => res.send(err.message)); // handle error
};

const GetEvent = async (req, res) => {
  const { eventId, orgId } = req.params;
  const { id: userId } = req.user;

  VoteEvent.findById(eventId)
    .populate({
      path: "holder",
      model: "Organization",
      select: "organization admin",
      populate: {
        path: "admin",
        model: "User",
        select: "email name",
      },
    })
    .populate({
      path: "registeredVoters.voter",
      model: "User",
      select: "name",
    })
    .then((result) => {
      const isUserRegistered = result.registeredVoters
        .map((voters) => {
          return voters.voter._id.toString() === userId;
        })
        .includes(true);

      res.status(200).json({
        status: "success",
        ...(isUserRegistered
          ? {
              isUserRegistered,
              hasVoted: checkHasVote(result.registeredVoters, userId),
            }
          : { isUserRegistered }),
        isAdmin: isAdmin(result.holder.admin, userId),
        result,
        userId,
      });
    })
    .catch((e) =>
      res.status(500).send({
        status: "error",
        msg: e,
      })
    );
};

const EditEvent = async (req, res) => {
  // not resolved yet
  const { eventId } = req.params;

  const { candidates, registeredVoters, isActive } = req.body;

  const emailArr = registeredVoters.map((v) => {
    return v.voter;
  });
  User.find({ email: { $in: emailArr } })
    .then((ress) => {
      if (!ress)
        return res.json({
          status: "not found",
          msg: "data cannot be found",
        });

      const data = ress.map((v) => {
        return { voter: v._id.toString() };
      });

      const update = {
        $set: {
          isActive,
          candidates: [...candidates],
          registeredVoters: [...data],
        },
      };
      const opt = { new: true };

      return VoteEvent.findByIdAndUpdate(eventId, update, opt);
    })
    .then((results) => {
      return res.status(200).json({
        status: "success",
        results,
      });
    })
    .catch((err) => {
      res.status(500).json({ status: "error", msg: err });
    });
};

const HandleVote = async (req, res) => {
  const { eventId } = req.params;
  const { candidateId } = req.body;

  const { id: userId } = req.user;

  const update = {
    $inc: {
      "candidates.$[candidate].numOfVotes": 1,
    },
    $set: {
      "registeredVoters.$[voter].hasVoted": true,
    },
  };
  const opt = {
    arrayFilters: [
      {
        "candidate._id": candidateId,
      },
      {
        "voter.voter": userId,
      },
    ],
    new: true,
  };

  VoteEvent.findById(eventId)
    .populate("holder registeredVoters.voter", "email name")
    .then(async (result) => {
      const alreadyVote = checkHasVote(result.registeredVoters, userId);

      if (alreadyVote) {
        throw { status: 400, msg: "You cannot vote more than once per event" };
      }

      return VoteEvent.findByIdAndUpdate(eventId, update, opt).populate(
        "holder registeredVoters.voter",
        "email name"
      );
    })
    .then(async (result) => {
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          voteParticipation: result.id,
        },
      });
      return res.status(200).json({
        status: "success",
        hasVoted: checkHasVote(result.registeredVoters, userId),
        result,
      });
    })
    .catch((err) => {
      if (err.status === 400)
        return res.status(400).json({ status: "error", msg: err.msg });

      return res.status(500).json({
        status: "error",
        msg: err,
      });
    });
};

const StartEvent = async (req, res) => {
  const { orgId, eventId } = req.params;
  const { isActive } = req.body;
  const { id, email, name } = req.user;

  isUserTheAdmin(orgId, id)
    .then(() => {
      return VoteEvent.findByIdAndUpdate(eventId, { isActive }, { new: true })
        .populate({
          path: "holder",
          model: "Organization",
          select: "organization admin",
          populate: {
            path: "admin",
            model: "User",
            select: "email name",
          },
        })
        .populate({
          path: "registeredVoters.voter",
          model: "User",
          select: "name",
        });
    })
    .then((result) => {
      if (!result) {
        return res
          .status(400)
          .json({ status: "terjadi kesalahan", msg: "data tidak ditemukan" });
      }
      return res.status(200).json({ status: "success", result });
    })
    .catch((err) => {
      if (err.status === "403") return res.status(403).send(err.msg);

      return res.status(500).send(err);
    });
};

const getSingleCandidate = async (req, res) => {
  const { eventId, candidateId, orgId } = req.params;
  const { id } = req.user;

  isUserTheAdmin(orgId, id)
    .then(() => {
      return VoteEvent.findById(eventId);
    })
    .then((result) => {
      const { candidates } = result;
      const candidate = candidates.filter((v) => {
        if (v.id === candidateId) return v;
      });
      res.status(200).json(candidate[0]);
    })
    .catch((err) => {
      res.send(err);
    });
};

const EditCandidate = async (req, res) => {
  const { eventId, candidateId, orgId } = req.params;
  let imgUrl = `${req.protocol}://${req.get("host")}/candidates/${
    req.file.filename
  }`;

  const { calonKetua, calonWakil, description } = req.body;

  isUserTheAdmin(orgId, req.user.id)
    .then(() => {
      return VoteEvent.findByIdAndUpdate(
        eventId,
        {
          $set: {
            "candidates.$[i].calonKetua": calonKetua,
            "candidates.$[i].calonWakil": calonWakil,
            "candidates.$[i].description": description,
            "candidates.$[i].image.url": imgUrl,
          },
        },
        {
          arrayFilters: [{ "i._id": mongoose.Types.ObjectId(candidateId) }],
          new: true,
        }
      );
    })
    .then((res) => {
      return res.status(200).json({
        status: "ok",
        data: res,
      });
    })
    .catch((err) => {
      return res.send(err);
    });
};

export {
  AddEvent,
  GetEvent,
  EditEvent,
  HandleVote,
  StartEvent,
  EditCandidate,
  getSingleCandidate,
};
