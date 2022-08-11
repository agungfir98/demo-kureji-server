import JWT from "jsonwebtoken";
import User from "../model/user.model.js";

const createAccessToken = (payload) => {
  return JWT.sign(payload, process.env.PRIVATE_KEY, {
    algorithm: "HS256",
    expiresIn: "10m",
  });
};
const createRefreshToken = (payload) => {
  return JWT.sign(payload, process.env.REFRESH_PRIVATE_KEY, {
    algorithm: "HS256",
    expiresIn: "2d",
  });
};

const revokeUserRefreshToken = async (id) => {
  User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } })
    .then(() => {
      return { status: "revoked", msg: "token revoked" };
    })
    .catch((err) => {
      throw err;
    });
};

export { createRefreshToken, createAccessToken, revokeUserRefreshToken };
