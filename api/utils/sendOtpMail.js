import nodemailer from "nodemailer";

const sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.error("Mail transporter verification failed");
      } else {
        console.log("Server is ready to send mail");
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "Email Verification OTP",

      html: `
        <div style="font-family:sans-serif;padding:20px">
          <h2>Email Verification</h2>

          <p>Your OTP for registration is:</p>

          <h1 style="letter-spacing:4px;color:blue">
            ${otp}
          </h1>

          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("OTP mail sending failed");

    return false;
  }
};

export default sendOtpMail;
