const User = require("../model/userModel");

const isLogin = async (req, res, next) => {
  try {
    if (!req.session.user_id) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.user_id);

    if (user.isActive === false) {
      req.session.destroy();
      return res.render("user/login", { message: "Your account is blocked" });
    }

    next();
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect("/home");
    }

    next();
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  isLogin,
  isLogout,
};
