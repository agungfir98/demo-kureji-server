import JWT from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "../auth/handler.js";
import User from "../model/user.model.js";

const refreshToken = async (req, res) => {
  const token = req.cookies.gid;

  if (!token)
    return res.status(401).json({ status: "error", msg: "no access token" });

  let payload = null;
  try {
    payload = JWT.verify(token, process.env.REFRESH_PRIVATE_KEY);
  } catch (error) {
    return res.status(401).json({ status: "error", msg: "invalid token" });
  }

  User.findById(payload.id)
    .then((result) => {
      if (result.tokenVersion !== payload.tokenVersion)
        return res.status("403").json({
          status: "revoked",
          token: "",
        });

      if (!result) return res.status(404).json({ status: "error", token: "" });
      const data = {
        id: result.id,
        email: result.email,
        name: result.name,
      };
      return res
        .status(200)
        .cookie(
          "gid",
          createRefreshToken({ ...data, tokenVersion: result.tokenVersion }),
          {
            httpOnly: false,
            sameSite: "None",
            secure: true,
            expire: new Date(Date.now() + 48 * 3600000),
          }
        )
        .json({
          status: "success",
          token: createAccessToken(data),
        });
    })
    .catch(() => {
      return res
        .status(500)
        .json({ status: "error", msg: "service unavailable" });
    });
};

export { refreshToken };
