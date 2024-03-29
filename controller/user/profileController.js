const User = require("../../model/userModel");
const UserOTPVerification = require("../../model/userOTPVerification");
const Address = require("../../model/addressModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const loadProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    const userAddress = await Address.find({ userId: req.session.user_id });

    return res.render("user/profileNew", { user, userAddress });
  } catch (error) {
    console.log(error.message);
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.session.user_id },
      { $set: { profile: req.body.image } }
    );
    res.redirect("/profile");
  } catch (error) {
    res.render("error/internalError", { error });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.session.user_id },
      { $set: { profile: "" } }
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    res.render("user/editProfile", { user });
  } catch (error) {
    console.log(error.message);
  }
};

const editProfile = async (req, res) => {
  try {
    const { id, name, email, phone } = req.body;
    const user = await User.findById(id);

    if (user) {
      // Validate email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(email)) {
        return res.render("user/editProfile", {
          activePage: "profile",
          user: req.session.user_id,
          userProfile: user,
          error: "Enter a valid Gmail address.",
        });
      }

      // Validate phone (10 digits)
      if (!/^\d{10}$/.test(phone)) {
        return res.render("user/editProfile", {
          activePage: "profile",
          user: req.session.user_id,
          userProfile: user,
          error: "Mobile number should be 10 digits.",
        });
      }

      const hasChanges =
        user.name !== name ||
        user.email !== email ||
        user.phone !== parseInt(phone);

      if (hasChanges) {
        if (user.name !== name) {
          await User.updateOne({ _id: id }, { $set: { name } });
        }

        if (user.phone !== parseInt(phone)) {
          await User.updateOne({ _id: id }, { $set: { phone } });
        }

        if (user.email !== email) {
          const existingEmail = await User.findOne({ email: email });

          if (existingEmail) {
            return res.render("user/editProfile", {
              activePage: "profile",
              user: req.session.user_id,
              userProfile: user,
              error: "Email already exists.",
            });
          }

          const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

          // mail options
          const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `<p>Enter <b>${otp}</b> in the website changing for email verifying process</p>
                  <p>This code <b>expires in 1 minute</b>.</p>`,
          };

          // hash the otp
          const saltRounds = 10;
          const hashedOTP = await bcrypt.hash(otp, saltRounds);

          const newOTPVerification = await UserOTPVerification.create({
            userId: id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000,
          });

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.AUTH_EMAIL,
              pass: process.env.AUTH_PASS,
            },
          });

          // save otp record
          await newOTPVerification.save();
          await transporter.sendMail(mailOptions);
          res.redirect(`/verifyChangeMail?userId=${user._id}&changeMail=${email}`);
        } else {
          res.redirect("/profile");
        }
      } else {
        return res.render("user/editProfile", {
          activePage: "profile",
          user: req.session.user_id,
          userProfile: user,
          error: "You have to make some changes",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadOTPChangeMail = async (req, res) => {
  try {
    if (req.query.userId && req.query.changeMail) {
      res.render("user/changeMail-otp", {
        userId: req.query.userId,
        changeMail: req.query.changeMail,
      });
    } else {
      return res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTPChangeMail = async (req, res) => {
  try {
    let { otp, userId, changeMail } = req.body;
    if (!userId || !otp || !changeMail) {
      res.render("user/changeMail-otp", {
        message: `Empty otp details are not allowed`,
        userId,
        changeMail,
      });
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId,
      });
      if (UserOTPVerificationRecords.length <= 0) {
        //no record found
        res.render("user/changeMail-otp", {
          message: "Account record doesn't exist. Please sign up",
          userId,
          changeMail,
        });
      } else {
        //user otp records exists
        const { expiresAt } =
          UserOTPVerificationRecords[UserOTPVerificationRecords.length - 1];
        const hashedOTP =
          UserOTPVerificationRecords[UserOTPVerificationRecords.length - 1].otp;

        if (expiresAt < Date.now()) {
          //user otp records has expired
          await UserOTPVerification.deleteMany({ userId });
          res.render("user/changeMail-otp", {
            message: "Code has expired. Please request again.",
            userId,
            changeMail,
          });
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            //supplied otp is wrong
            res.render("user/changeMail-otp", {
              message: "Invalid OTP. Check your Email.",
              userId,
              changeMail,
            });
          } else {
            //success
            await User.updateOne(
              { _id: userId },
              { $set: { email: changeMail } }
            );
            await UserOTPVerification.deleteMany({ userId });
            res.redirect("/profile");
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadChangePass = async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    res.render("user/changePass", { user });
  } catch (error) {
    console.log(error.message);
  }
};

const changePass = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    const user = await User.findById(id);

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (passwordMatch) {
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await User.updateOne(
        { _id: id },
        { $set: { password: hashedNewPassword } }
      );

      return res.redirect("/profile");
    } else {
      return res.render("user/changePass", {
        activePage: "profile",
        user: req.session.user_id,
        user,
        error: "Your current password is incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadForgotPass = async (req, res) => {
  try {
    res.render("user/forgotPassEmail");
  } catch (error) {
    console.log(error.message);
  }
};

var smtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
};
var transporter = nodemailer.createTransport(smtpConfig);

const loadOTPForgotPass = async (req, res) => {
  try {
    if (!req.body.email)
      return res.render("user/forgotPassEmail", {
        error: "email should be filled",
      });
    const userData = await User.findOne({ email: req.body.email });
    if (userData.email !== req.body.email) {
      return res.render("user/forgotPassEmail", {
        error: "Your email is incorrect",
      });
    } else {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

      // mail options
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userData.email,
        subject: "Verify Your Email",
        html: `<p>Enter <b>${otp}</b> in the website verify your email address to forget password process</p>
                  <p>This code <b>expire in 1 minutes</b>.</p>`,
      };

      // hash the otp
      const saltRounds = 10;

      const hashedOTP = await bcrypt.hash(otp, saltRounds);
      const newOTPVerification = await new UserOTPVerification({
        userId: userData._id,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
      });

      // save otp record
      await newOTPVerification.save();
      await transporter.sendMail(mailOptions);

      res.redirect(`/verifyOTPForgetPass?userId=${userData._id}`);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOTPForgetPassPage = async (req, res) => {
  try {
    res.render("user/changePass-otp", { userId: req.query.userId });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTPForgetPassPage = async (req, res) => {
  try {
    let { otp, userId } = req.body;
    if (!userId || !otp) {
      res.render("user/changePass-otp", {
        message: `Empty otp details are not allowed`,
        userId,
      });
    } else {
      const UserOTPVerificationRecords = await UserOTPVerification.find({
        userId,
      });
      if (UserOTPVerificationRecords.length <= 0) {
        //no record found
        res.render("user/changePass-otp", {
          message: "Account record doesn't exist . Please sign up",
          userId,
        });
      } else {
        //user otp records exists
        const { expiresAt } = UserOTPVerificationRecords[0];
        const hashedOTP = UserOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          //user otp records has expires
          await UserOTPVerification.deleteMany({ userId });
          res.render("user/changePass-otp", {
            message: "Code has expires. Please request again.",
            userId,
          });
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            //supplied otp is wrong
            res.render("user/changePass-otp", {
              message: "Invalid OTP. Check your Email.",
              userId,
            });
          } else {
            //success
            await UserOTPVerification.deleteMany({ userId });
            res.render("user/forgotPass", { userId });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPassChange = async (req, res) => {
  try {
    const userId = await User.findById(req.session.user_id);
    const { newPassword } = req.body;

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.updateOne(
      { _id: userId },
      { $set: { password: hashedNewPassword } }
    );

    res.render("user/forgotPass", {
      success: "Your Password has been changed successfully",
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const userAddress = await Address.find({ userid: req.session.user_id });
    const user = await User.findById(req.session.user_id);
    if (userAddress.length < 3) {
      res.render("user/addAddress", { activePage: "profile", user });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, phone, country, state, district, city, pincode, address } =
      req.body;
    const user = await User.findById(req.session.user_id);

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.render("user/addAddress", {
        activePage: "profile",
        user,
        error: "Phone number should be 10 digits.",
      });
    }
    const check = await Address.find({ userId: req.session.user_id });

    if (check.length > 0) {
      const addAddress = new Address({
        userId: req.session.user_id,
        name,
        phone,
        country,
        state,
        district,
        city,
        pincode,
        address,
      });
      addAddress.save();
    } else {
      const addAddress = new Address({
        userId: req.session.user_id,
        name,
        phone,
        country,
        state,
        district,
        city,
        pincode,
        address,
        default: true,
      });
      addAddress.save();
    }

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById(req.session.user_id);

    const editAddress = await Address.findById(id);

    if (editAddress) {
      res.render("user/editAddress", {
        activePage: "profile",
        user,
        editAddress,
      });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  try {
    const { name, phone, country, state, district, city, pincode, address } =
      req.body;
    const user = req.session.user_id;

    if (user) {
      const addressId = req.body.id;
      const editAddress = await Address.findById(addressId);
      if (editAddress) {
        await Address.updateOne(
          { _id: addressId },
          {
            $set: {
              name,
              phone,
              country,
              state,
              district,
              city,
              pincode,
              address,
            },
          }
        );
      }
    }

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const checkTorF = await Address.findById({ _id: req.query.id });

    const check = await Address.findOne({
      user: req.session.user_id,
      default: false,
    });

    if (check) {
      if (checkTorF.default === true) {
        await Address.updateOne({ _id: check._id }, { default: true });
      }
    }

    await Address.findByIdAndDelete({ _id: req.query.id });

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const generateCode = async (req, res) => {
  try {
    const length = 10;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomCode = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomCode += characters.charAt(randomIndex);
    }

    const findUser = await User.findById(req.session.user_id);
    findUser.referralCode = randomCode;
    if (findUser) {
      await findUser.save();

      return res.redirect("/profile");
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  loadProfile,
  updateProfilePhoto,
  deleteProfilePhoto,
  loadEditProfile,
  editProfile,
  loadOTPChangeMail,
  verifyOTPChangeMail,
  loadChangePass,
  changePass,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,
  generateCode,
  loadForgotPass,
  loadOTPForgotPass,
  loadOTPForgetPassPage,
  verifyOTPForgetPassPage,
  forgotPassChange,
};
