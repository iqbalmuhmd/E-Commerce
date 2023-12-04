const User = require('../../model/userModel');
const UserOTPVerification = require("../../model/userOTPVerification");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const loadHome = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    return res.render('user/index', { user });
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render('user/login');
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.isVerified) {
          if (!userData.isActive) {
            res.render('user/login', { message: 'Your account has been blocked' });
          }
          req.session.user_id = userData._id;
          return res.redirect('/');
        } else {
          res.render('user/login', { message: 'User not verified yet!!' });
        }
      } else {
        res.render('user/login', { message: 'Password not match!!' });
      }
    } else {
      res.render('user/login', { message: 'User not found!!' });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render('user/register');
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const insertUser = async (req, res) => {
  try {
    const existingEmail = await User.findOne({ email: req.body.email });

    if (existingEmail) return res.render('user/register', { error: 'Email already exists!!' });

    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: spassword,
      isVerified: false
    });

    user.save()
      .then((result) => {
        sendOTPVerificationEmail(result, res);
      })
      .catch((err) => {
        console.log(err);
        res.render("user/register", { message: "An error occurred while saving process" });
      });

    if (user) {
      res.redirect(`/verifyOTP?userId=${user._id}`);
    } else {
      res.render("user/register", { error: "Your signup has failed" });
    }
  } catch (error) {
    console.error(error);
  }
};

// Nodemailer stuff
let transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(process.env.AUTH_EMAIL);

    // Mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the signup process</p>
             <p>This code <b>expires in 1 minute</b>.</p>`,
    };

    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = await new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
    });

    // Save OTP record
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const loadOTPpage = async (req, res) => {
  try {
    const userId = req.query.userId;
    res.render("user/signup-otp", { userId });
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

// verify otp mail
const verifyOTPSignup = async (req, res) => {
  try {
    let { otp, userId } = req.body;
    if (!userId || !otp) {
      res.render("user/signup-otp", { message: `Empty otp details are not allowed`, userId });
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId,
      });

      if (UserOTPVerificationRecords.length <= 0) {
        // no record found
        res.render("user/signup-otp", { message: "Account record doesn't exist or has been verified already. Please sign up or log in.", userId });
      } else {
        // user otp records exist
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          // user otp records have expired
          await UserOTPVerification.deleteMany({ userId });
          res.render("user/signup-otp", { message: "Code has expired. Please request again.", userId });
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            // supplied otp is wrong
            res.render("user/signup-otp", { message: "Invalid OTP. Check your Email.", userId });
          } else {
            // success
            await User.updateOne({ _id: userId }, { $set: { isVerified: true } });
            await UserOTPVerification.deleteMany({ userId });
            res.redirect("/login");
          }
        }
      }
    }
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const Logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/home");
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

module.exports = {
  loadHome,
  loadLogin,
  loadRegister,
  insertUser,
  loadOTPpage,
  verifyOTPSignup,
  verifyLogin,
  Logout
};
