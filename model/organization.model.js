import mongoose from "mongoose";

const Organization = mongoose.model(
  "Organization",
  new mongoose.Schema(
    {
      organization: {
        type: String,
      },
      adminName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )
);
export default Organization;
