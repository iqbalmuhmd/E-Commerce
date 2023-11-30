const User = require("../model/userModel");

const isLogin = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            res.redirect("/login");
        } else {
            const user = await User.findById(req.session.user_id);

            if (user.isActive === true) {
                req.session.destroy();
                return res.render("users/login", { message: "Your account is blocked" });
            } else {
                next();
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect("/home");
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
};
