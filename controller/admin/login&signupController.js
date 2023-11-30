const User = require('../../model/userModel');
const bcrypt = require("bcrypt");

const loadLogin = async (req, res) => {
    try {
        res.render('admin/login');
    } catch (error) {
        res.render("error/internalError", { error });
    }
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_admin === false) {
                    res.render("admin/login", { message: "Email and password are incorrect" });
                } else {
                    req.session.userid = userData.id;
                    res.render("admin/dashboard");
                }
            } else {
                res.render("admin/login", { message: "Email and password are incorrect" });
            }
        } else {
            res.render("admin/login", { message: "Email and password are incorrect" });
        }

    } catch (error) {
        res.render("error/internalError", { error });
    }
};

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/admin");
    } catch (error) {
        res.render("error/internalError", { error });
    }
};

module.exports = {
    loadLogin,
    verifyLogin,
    logout,
};
