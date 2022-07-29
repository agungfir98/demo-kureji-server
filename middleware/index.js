import JWT from "jsonwebtoken";

export async function runAuth(req, res, next) {
  const tokenHeader = req.header("auth-token");
  if (!tokenHeader) return res.status(401).send("akses ditolak");

  try {
    const verified = JWT.verify(tokenHeader, process.env.PRIVATE_KEY);
    // const decode = JWT.decode(tokenHeader, { complete: true, json: true });
    console.log(verified);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
}
