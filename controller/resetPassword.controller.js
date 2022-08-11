import { revokeUserRefreshToken } from "../auth/handler.js";
import User from "../model/user.model.js";

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((result) => {
      revokeUserRefreshToken(result.id);
      return res.json({ status: "revoked", token: "" });
    })
    .catch((err) => res.send(err));
};
