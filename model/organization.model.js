import mongoose from "mongoose";

const Organization = mongoose.model(
  "Organization",
  new mongoose.Schema(
    {
      organization: {
        type: String,
      },
      description: String,
      admin: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "User",
        },
      ],
      members: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
      voteEvents: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Voteevent",
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);
export default Organization;
