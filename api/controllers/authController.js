import Otp from "../models/Otp.js";
import User from "../models/User.js";
import sendOtpMail from "../utils/sendOtpMail.js";

export const sendOtp = async (req, res) => {
  try {
    const { email, password } = req.body;

    //  validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    //  validate password (SECURITY LAYER)
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password required",
      });
    }

    if (password.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 5 characters",
      });
    }

    const emailNormalized = email.trim().toLowerCase();

    // check existing user
    const existingUser = await User.findOne({
      email: emailNormalized,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: emailNormalized });

    await Otp.create({
      email: emailNormalized,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const mailSent = await sendOtpMail(emailNormalized, otp);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// export const sendOtp = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email required",
//       });
//     }

//     const emailNormalized = email.trim().toLowerCase();

//     const existingUser = await User.findOne({ email: emailNormalized });

//     // ONLY block if user exists AND trying register flow (frontend handles it)
//     // DO NOT block OTP for guest or register blindly
//     if (existingUser && password) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     // password validation ONLY if sent
//     if (password && password.length < 5) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 5 characters",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     await Otp.deleteMany({ email: emailNormalized });

//     await Otp.create({
//       email: emailNormalized,
//       otp,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     });

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully",
//     });

//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };