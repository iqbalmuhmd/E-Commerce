const adminLogin = async (req, res, next) => {
    try {
      if (!req.session.admin) {
        return res.redirect("/admin/login");
      }
      return next();
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const adminLogout = async (req, res, next) => {
    try {
      if (req.session.admin) {
        return res.redirect("/admin/dashboard");
      }
      return next();
    } catch (error) {
      console.log(error.message);
    }
  };
  
  module.exports = {
    adminLogin,
    adminLogout
  };
  