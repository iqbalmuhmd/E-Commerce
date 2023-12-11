const express = require('express')
const userRouter = express()
const bodyParser = require("body-parser")

userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({ extended: true }))
userRouter.set('view engine', 'ejs')

userRouter.use(function (req, res, next) {
    req.header(
      "Cache-Control",
      "no-cache, privante, no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Expires', '0');
    next();
  });


const userAuth = require('../middleware/userAuth')
const loginSignUpController = require('../controller/user/login&signupController')
const mainController = require('../controller/user/mainController')
const profileController = require('../controller/user/profileController')
const imageUpload = require('../middleware/imageUpload')



// Home
userRouter.get('/', loginSignUpController.loadHome);
userRouter.get('/home', loginSignUpController.loadHome);

// Login
userRouter.get('/login', userAuth.isLogout, loginSignUpController.loadLogin);
userRouter.post('/login', userAuth.isLogout, loginSignUpController.verifyLogin);

// Register
userRouter.get('/register', userAuth.isLogout, loginSignUpController.loadRegister);
userRouter.post('/register', loginSignUpController.insertUser);

// OTP Verification
userRouter.get('/verifyOTP', userAuth.isLogout, loginSignUpController.loadOTPpage);
userRouter.post('/verifyOTP', loginSignUpController.verifyOTPSignup);

// Logout
userRouter.get('/logout', loginSignUpController.Logout);

// Shop
userRouter.get('/shop', mainController.loadShop);

// Product Detail
userRouter.get('/productDetail', mainController.loadproductDetail);

// Verify User
userRouter.get('/verifyUser', userAuth.isLogout, loginSignUpController.loadVerifyUser);
userRouter.post('/verifyUser', userAuth.isLogout, loginSignUpController.verifyUserEmail);

// Profile
userRouter.get('/profile', userAuth.isLogin, profileController.loadProfile);

// Edit Profile
userRouter.get('/edit-profile', userAuth.isLogin, profileController.loadEditProfile);
userRouter.post('/edit-profile', userAuth.isLogin, profileController.editProfile);

// Profile Photo
userRouter.patch('/profile/editPhoto', userAuth.isLogin, imageUpload.uploadProfileImage, imageUpload.resizeProfileImage, profileController.updateProfilePhoto);
userRouter.get('/profile/deletePhoto', userAuth.isLogin, profileController.deleteProfilePhoto);

// Verify Change Mail
userRouter.get('/verifyChangeMail', userAuth.isLogin, profileController.loadOTPChangeMail);
userRouter.post('/verifyChangeMail', userAuth.isLogin, profileController.verifyOTPChangeMail);

// Change Password
userRouter.get('/change-password', profileController.loadChangePass)
userRouter.post('/change-password', profileController.changePass)

module.exports = userRouter