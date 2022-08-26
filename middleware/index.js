import JWT from "jsonwebtoken";
import Organization from "../model/organization.model.js";

export async function runAuth(req, res, next) {
  const tokenHeader = req.header("auth-token");
  if (!tokenHeader) return res.status(401).send("akses ditolak");

  try {
    const token = tokenHeader.split(" ")[1];
    const verified = JWT.verify(token, process.env.PRIVATE_KEY);
    // const decode = JWT.decode(tokenHeader, { complete: true, json: true });
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
}

export const isUserTheAdmin = async (orgId, userId) => {
  return Organization.findById(orgId).then((result) => {
    if (userId !== result.admin.toString())
      throw {
        status: "403",
        msg: "you are not allowed to perform this action!",
      };
  });
};
