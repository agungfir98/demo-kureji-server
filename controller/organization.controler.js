import Organization from "../model/organization.model.js";
import User from "../model/user.model.js";

const CreateOrganization = async (req, res) => {
  const { orgName, description } = req.body;

  const userId = req.user.id;

  const isOrgExist = await Organization.findOne({
    organization: orgName,
  });

  if (isOrgExist) return res.send("organisasi sudah pernah terdaftar.");

  const newOrg = await new Organization({
    organization: orgName,
    description,
    admin: userId,
  });

  newOrg
    .save()
    .then((result) => {
      User.findById(userId)
        .then((ress) => {
          ress.organization.push({ _id: result.id });
          ress.save();
        })
        .catch((err) =>
          res.status(500).json({
            status: "error",
            msg: err,
          })
        );
      return res.status(200).json({
        status: "success",
        result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "error",
        msg: err,
      });
    });
};

const GetOrg = async (req, res) => {
  const getAll = await Organization.find({});
  return res.send(getAll);
};

const OrgDetail = async (req, res) => {
  const { orgId } = req.params;

  await Organization.findById(orgId)
    .select("_id organization admin voteEvents")
    .populate("admin voteEvents", "name email voteTitle")
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch(() => res.status(404).send("user tidak ditemukan"));
};

export { CreateOrganization, OrgDetail, GetOrg };
