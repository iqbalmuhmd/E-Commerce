const Admin = require('../../model/adminModel')
const referral = require('../../model/referralModel')


// Referral
const loadReferral = async (req, res) => {
    try {
      const admin = await Admin.findById( req.session.admin )
      res.render("admin/referral", { admin });
    } catch (error) {
      console.log(error.message);
    }
};
  
const addReferral = async (req, res) => {
    try {
      const { referralAmount } = req.body;
      const admin = await Admin.findById(req.session.admin)
      await Admin.updateOne(
        { email: admin.email },
        { $set: { referralAmount: referralAmount } }
      );
  
      res.redirect("/admin/referral");
    } catch (error) {
      console.log(error.message);
    }
};
  

  module.exports = {
    loadReferral,
    addReferral,
};
