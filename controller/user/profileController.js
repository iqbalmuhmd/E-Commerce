const User = require('../../model/userModel');
const bcrypt = require("bcrypt")

const loadProfile = async(req,res) =>{
    try {
        const user = await User.findById(req.session.user_id);
    return res.render('user/profile', { user });
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfilePhoto = async (req, res) => {
    try {
        await User.updateOne({ _id: req.session.user_id }, { $set: { profile: req.body.image } })
        res.redirect("/profile")
    } catch (error) {
        res.render("error/internalError", { error })
    }
};

const deleteProfilePhoto = async(req, res) =>{
    try {
        await User.updateOne({ _id: req.session.user_id}, { $set: {profile: ''}})
        res.redirect('/profile')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProfile,
    updateProfilePhoto,
    deleteProfilePhoto
}