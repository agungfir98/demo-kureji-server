import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../auth/handler.js";

const RegisterUser = async (req, res) => {
  const { email, name, password, confirmPw } = req.body;

  const isEmailExist = await User.findOne({ email: email });

  if (isEmailExist)
    return res
      .status(400)
      .json({ form: "email", msg: "email sudah digunakan" });

  if (password !== confirmPw)
    return res
      .status(400)
      .json({ form: "password", msg: "password tidak sama" });

  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

  const newUser = await new User({ email, name, password: hashedPassword });

  newUser
    .save()
    .then((result) => {
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        status: "error",
        msg: err,
      });
    });
};

const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist)
    return res.status(404).json({
      status: "error",
      form: "email",
      msg: "User dengan email ini tidak ditemukan",
    });

  const compare = await bcrypt.compare(password, isUserExist.password);

  if (!compare)
    return res.status(400).json({
      status: "error",
      form: "password",
      msg: "Password salah",
    });

  if (!isUserExist.token_version) isUserExist.set("token_version", 0).save();

  const { id, email: emailDB, name } = isUserExist;

  const payload = {
    id,
    email: emailDB,
    name,
  };

  const token = createAccessToken(payload);

  res
    .status(200)
    .header("auth-token")
    .cookie(
      "gid",
      createRefreshToken({
        ...payload,
        tokenVersion: isUserExist.tokenVersion,
      }),
      { httpOnly: true }
    )
    .json({
      msg: "login berhasil",
      token,
    });
};

const GetUser = async (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .select("id email name organization voteParticipation")
    .then((result) => {
      res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        msg: `user dengan id ${id} tidak ditemukan`,
      });
    });
};
const GetUsers = async (req, res) => {
  User.find({})
    .then((result) => {
      res.status(200).json({
        status: "success",
        msg: result,
      });
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        msg: err,
      })
    );
};

const LogoutUser = async (req, res) => {
  res.status(200).cookie("gid", "", { httpOnly: true }).json({
    msg: "loged out",
  });
};

export { RegisterUser, LoginUser, GetUser, GetUsers, LogoutUser };
