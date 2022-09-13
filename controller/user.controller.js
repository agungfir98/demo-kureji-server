import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../auth/handler.js";
import Organization from "../model/organization.model.js";

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
      {
        httpOnly: false,
        sameSite: "None",
        secure: true,
        expires: new Date(Date.now() + 48 * 3600000),
      }
    )
    .json({
      msg: "login berhasil",
      token,
    });
};

const GetUser = async (req, res) => {
  const userId = req.user.id;
  User.findById(userId)
    .populate({
      path: "organization",
      model: "Organization",
      populate: {
        path: "voteEvents",
        model: "Voteevent",
        populate: {
          path: "holder",
          model: "Organization",
          select: "organization",
        },
      },
    })
    .populate({
      path: "voteParticipation",
      model: "Voteevent",
      populate: {
        path: "holder",
        model: "Organization",
        select: "organization _id",
      },
    })
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
        msg: `user dengan id ${userId} tidak ditemukan`,
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
  res
    .status(200)
    .clearCookie("gid", { httpOnly: false, sameSite: "None", secure: true })
    .json({
      msg: "loged out",
    });
};

const GetUserOrg = async (req, res) => {
  const userId = req.user.id;
  User.findById(userId)
    .populate({
      path: "organization",
      model: "Organization",
      populate: {
        path: "admin members",
        model: "User",
        select: "email name _id",
      },
    })
    .then((result) => {
      return res.status(200).json({
        status: "success",
        data: result.organization,
      });
    })
    .catch((err) =>
      res.status(500).json({ status: "error", msg: err.message })
    );
};

const searchUser = async (req, res) => {
  const { email } = req.body;
  User.aggregate([
    {
      $search: {
        index: "users",
        text: {
          path: "email",
          query: email,
          fuzzy: {},
        },
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        name: 1,
        email: 1,
      },
    },
  ])
    .then((result) => {
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => res.status(400).json({ status: "error", err }));
};

const DeleteUser = async (req, res) => {
  const { userId } = req.params;
  User.findByIdAndDelete(userId)
    .then((result) => {
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        status: "error",
        err,
      });
    });
};

export {
  RegisterUser,
  LoginUser,
  GetUser,
  GetUsers,
  LogoutUser,
  GetUserOrg,
  searchUser,
  DeleteUser,
};
