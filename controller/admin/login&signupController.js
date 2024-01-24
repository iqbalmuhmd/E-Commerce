const Admin = require('../../model/adminModel');

const loadLogin = async (req, res) => {
  try {
    res.render('admin/login');
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const validEmail = await Admin.findOne({ email });
    
    if (validEmail) {
      if (password === validEmail.password) {
        req.session.admin = validEmail._id;
        res.redirect("/admin/dashboard");
      } else {
        res.render('admin/login', {message: 'Admin not found'})
      }
    }
    
  } catch (error) {
    console.log(error.message);
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
