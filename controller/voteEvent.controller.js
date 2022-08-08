import VoteEvent from "../model/voteEvent.model.js";
import Organization from "../model/organization.model.js";
import User from "../model/user.model.js";

const AddEvent = async (req, res) => {
  const { orgId } = req.params;
  const { voteTitle, candidates, registeredVoters } = req.body;
  const isExist = await VoteEvent.findOne({ voteTitle });
  if (isExist) return res.send("udah ada");

  const addEvent = new VoteEvent({ voteTitle, candidates, registeredVoters });

  Organization.findById(id)
    .then((data) => {
      if (!data)
        return res
          .status(404)
          .json({ status: "error", msg: "Organization cannot be found" });
    })
    .catch((err) => res.status(500).send("something wrong with the server"));

  addEvent
    .save()
    .then((result) => {
      Organization.findById(id).then((ress) => {
        ress.voteEvents.push({ _id: result.id });
        return ress.save();
      });
      return res.status(200).json({
        msg: "event berhasil dibuat",
        result,
        request: {
          type: "GET",
          url: `http://localhost:3000/org/${id}/events/${result.id}`,
        },
      });
    })
    .catch((e) => res.status(500).json({ msg: e }));
};

const GetEvent = async (req, res) => {
  const { eventId } = req.params;

  VoteEvent.findById(eventId)
    .populate(
      "candidates.person registeredVoters.voter",
      "voteTitle isActive candidates registeredVoters voter _id email name"
    )
    .then((result) => {
      res.status(200).send(result);
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
  const { eventId, candidateId } = req.params;

  const payload = req.user;

  const update = {
    $inc: {
      "candidates.$[elem].numOfVotes": 1,
    },
    $set: {
      "registeredVoters.$[voter].hasVoted": true,
    },
  };
  const opt = {
    arrayFilters: [
      {
        "elem.person": candidateId,
      },
      {
        "voter.voter": payload.id,
      },
    ],
    new: true,
  };

  VoteEvent.findByIdAndUpdate(eventId, update, opt)
    .then((result) => {
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        status: "error",
        msg: err,
      });
    });
};

export { AddEvent, GetEvent, EditEvent, HandleVote };
