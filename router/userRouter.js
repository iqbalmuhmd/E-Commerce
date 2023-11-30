const express = require('express')
const userRouter = express()
const bodyParser = require("body-parser")
const session = require('express-session')

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

userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({ extended: true }))

userRouter.use(session({
    secret: 'thisismysecret',
    resave: false, 
    saveUninitialized: false
}))

const loginSignUpController = require('../controller/user/login&signupController')
const auth = require('../middleware/auth')

userRouter.get('/', loginSignUpController.loadHome)
userRouter.get('/home', loginSignUpController.loadHome)
userRouter.get('/login', auth.isLogout, loginSignUpController.loadLogin)
userRouter.post('/login', auth.isLogout, loginSignUpController.verifyLogin)
userRouter.get('/register', auth.isLogout, loginSignUpController.loadRegister)
userRouter.post('/register', loginSignUpController.insertUser)
userRouter.get('/verifyOTP', auth.isLogout, loginSignUpController.loadOTPpage)
userRouter.post('/verifyOTP', loginSignUpController.verifyOTPSignup)
userRouter.get('/logout', loginSignUpController.Logout)

module.exports = userRouter
