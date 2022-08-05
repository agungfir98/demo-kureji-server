import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

const RegisterUser = async (req, res) => {
  const { email, name, password, confirmPw } = req.body;

  const isEmailExist = await User.findOne({ email: email });

  if (isEmailExist) return res.send("email sudah digunakan");

  if (password !== confirmPw)
    return res.status(400).send("password tidak sama");

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

  if (!isUserExist) return res.status(404).send("User Tidak ditemukan");

  const compare = await bcrypt.compare(password, isUserExist.password);

  if (!compare) return res.status(400).send("password salah!");
  const { id, email: emailDB, name } = isUserExist;

  const payload = {
    id,
    email: emailDB,
    name,
  };

  const token = JWT.sign(payload, process.env.PRIVATE_KEY, {
    algorithm: "HS256",
  });

  res.status(200).header("auth-token", token).json({
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

export { RegisterUser, LoginUser, GetUser, GetUsers };
