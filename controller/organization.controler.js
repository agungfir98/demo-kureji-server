import Organization from "../model/organization.model.js";
import bcryppt from "bcrypt";
import JWT from "jsonwebtoken";

const RegisterOrganization = async (req, res) => {
  const { orgName, adminName, email, password } = req.body;

  const isOrgExist = await Organization.findOne({
    organization: orgName,
  });
  const isEmailExist = await Organization.findOne({
    email,
  });

  const hashedPassword = await bcryppt.hash(
    password,
    await bcryppt.genSalt(10)
  );

  if (isOrgExist) return res.send("organisasi sudah pernah terdaftar.");
  if (isEmailExist) return res.send("email sudah digunakan");

  const newOrg = await new Organization({
    organization: orgName,
    adminName,
    email,
    password: hashedPassword,
  });

  try {
    const savedOrg = await newOrg.save();
    res.status(200).json({
      msg: "data telah tersimpan",
      savedOrg,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const LoginOrganization = async (req, res) => {
  const { email, password } = req.body;

  const isEmailExist = await Organization.findOne({ email });
  if (!isEmailExist)
    return res.status(404).json({
      error: "terjadi kesalahan",
      message: "Email tidak ditemukan",
    });
  const hashedPassword = isEmailExist.password;

  const comparePW = await bcryppt.compare(password, hashedPassword);

  if (!comparePW) return res.status(400).json("password salah");

  const payload = {
    name: isEmailExist.adminName,
    organization: isEmailExist.organization,
    email: isEmailExist.email,
    id: isEmailExist.id,
  };

  const token = JWT.sign(payload, process.env.PRIVATE_KEY, {
    algorithm: "HS256",
  });

  res.status(200).header("auth-token", token).json({
    msg: "login berhasil",
    token,
  });
};

export { RegisterOrganization, LoginOrganization };
