import mongoose from "mongoose";

const VoteEvent = new mongoose.model(
  "Voteevent",
  new mongoose.Schema(
    {
      voteTitle: {
        type: String,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      finishedDate: {
        type: Date,
      },
      candidates: [
        {
          person: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
          },
          personTwo: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
          },
          description: { type: String, required: true },
          numOfVotes: { type: Number, default: 0 },
        },
      ],
      registeredVoters: [
        {
          voter: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
          hasVoted: { type: Boolean, default: false },
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);
export default VoteEvent;
