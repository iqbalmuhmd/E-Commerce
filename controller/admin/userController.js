const User = require("../../model/userModel");

const getUser = async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      console.log(users);
      return res.render('admin/users', { users });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const usersBlock = async (req, res) => {
  try {
    await User.updateOne({ _id: req.query.id }, { $set: { isActive: req.query.status } });
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getUser,
  usersBlock
};
