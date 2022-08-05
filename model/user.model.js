import mongoose from "mongoose";

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    organization: [
      {
        _id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Organization",
        },
      },
    ],
    voteParticipation: [
      {
        eventId: String,
        organization: String,
        voteTitle: String,
      },
    ],
  })
);
export default User;
