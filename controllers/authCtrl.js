import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import customError from "../helpers/customError.js";
import {generateResetToken , sendResetPasswordEmail} from '../helpers/passwordHelper.js'

const signin = async (req, res, next) => {
    try {
        let user = await User.findOne({ "email": req.body.email });
        if (!user) {
            return next(customError(401, "User not found! "));
        }
        if (!user.authenticate(req.body.password)) {
            return next(customError(401, "Email and password don't match!!"))
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
        const { hashed_password, salt,photo, ...finalUser } = user._doc;
        const result = { ...finalUser, token};
        return res.cookie("access_token" , token).status(200).json(result);

        // res.status(200).json(user);
    } catch (err) {
        console.log(err)
        next(customError(401, 'Could not sign in!'))
    }
}

const signout = (req, res, next) => {
    res.clearCookie('social_token');
    return res.status(200).json({ message: "Signned out!!" });
}

const forgotPassword = async(req, res, next) => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email not found!' });
      }
  
      // Generate reset token
      const resetToken = generateResetToken(32);
      user.resetToken = resetToken;
      user.resetTokenExpires = Date.now() + 3600000; // 1 hour in milliseconds
  
      // Save user with reset token and expiry
      await user.save();
  
      // Optionally send reset password email
      await sendResetPasswordEmail(email, resetToken);
  
      res.status(200).json({ message: 'Password reset instructions sent to your email!' });
    } catch (err) {
      next(err); // Pass error to error handler middleware
    }
  };

const requireSignin = (req, res, next) => {
    
    let token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, value) => {
        if (err) {
            next(new Error(err.message))
        }
        req.auth = value;
        next();
    })
};
const hasAuthorization = (req, res, next) => {
    let authorized = req.params.userId == req.auth._id;
    if (!authorized) {
        next(customError(401, "User is not authorized!!"));
    }
    next();
}

export default { signin, signout,forgotPassword, requireSignin, hasAuthorization };