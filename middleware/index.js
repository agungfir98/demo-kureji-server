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

export async function AuthAdmin(req, res, next) {
  const tokenHeader = req.header("auth-token");
  const { orgId, eventId } = req.params;

  if (!tokenHeader) return res.status(401).send("akses ditolak");

  const verify = JWT.verify(tokenHeader, process.env.PRIVATE_KEY);
  Organization.findById(orgId)
    .then((result) => {
      console.log(verify.id === result.admin.toString());
      if (verify.id !== result.admin.toString())
        return res.status(403).json({
          status: "forbidden",
          msg: "You don't have permission to perform this action",
        });
      next();
    })
    .catch((err) => {
      return res.status(401).send({ error: err });
    });
}
