// import OtpModel from "../models/Otp.js";
// import User from "../models/User.js";
// import sendOtpMail from "../utils/sendOtpMail.js";

// export const sendCheckoutOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email required",
//       });
//     }

//     const emailNormalized = email.trim().toLowerCase();

//     const existingUser = await User.findOne({ email: emailNormalized });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists. Please login.",
//       });
//     }

//     await OtpModel.deleteMany({ email: emailNormalized });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     await OtpModel.create({
//       email: emailNormalized,
//       otp,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     });

//     await sendOtpMail(emailNormalized, otp);

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent to email",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import sendOtpMail from "../utils/sendOtpMail.js";

export const sendCheckoutOtp = async (req, res) => {
  // console.log(" VERIFY REQUEST BODY:", req.body);
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

  
    const emailNormalized = email?.trim().toLowerCase();
    console.log("📩 SEND OTP FOR:", emailNormalized);

    const existingUser = await User.findOne({ email: emailNormalized });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    // delete old OTP
    await Otp.deleteMany({ email: emailNormalized });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const savedOtp = await Otp.create({
      email: emailNormalized,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log("💾 OTP SAVED:", savedOtp);

    await sendOtpMail(emailNormalized, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    console.log("SEND OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// VERIFY OTP (Checkout)
export const verifyCheckoutOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

   const emailNormalized = email.trim().toLowerCase().trim();
console.log("EMAIL FROM FRONTEND:", email);
console.log("NORMALIZED EMAIL:", emailNormalized);
console.log("OTP ENTERED:", otp);
const otpRecord = await Otp.findOne({ email: emailNormalized });

if (!otpRecord) {
  return res.status(400).json({
    success: false,
    message: "OTP already used or expired",
  });
}

if (otpRecord.expiresAt < new Date()) {
  return res.status(400).json({ message: "OTP expired" });
}

if (otpRecord.otp !== otp) {
  return res.status(400).json({ message: "Invalid OTP" });
}

// ONLY HERE DELETE
await Otp.deleteOne({ email: emailNormalized });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.log("VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};