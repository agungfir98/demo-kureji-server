import mongoose from "mongoose";

const VoteEvent = mongoose.model(
  "Voteevent",
  new mongoose.Schema(
    {
      voteTitle: {
        type: String,
      },
      holder: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Organization",
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
          calonKetua: {
            type: String,
            required: true,
          },
          calonWakil: {
            type: String,
          },
          description: { type: String, required: true },
          numOfVotes: { type: Number, default: 0 },
          image: {
            url: { type: String },
          },
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
