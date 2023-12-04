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


const loginSignUpController = require('../controller/user/login&signupController')
const userAuth = require('../middleware/userAuth')


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




module.exports = userRouter