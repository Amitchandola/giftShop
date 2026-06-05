import nodemailer from "nodemailer";

// Reuse transporter across calls to avoid reconnecting every time
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 3,
    });
  }
  return transporter;
};

const sendOtpMail = async (email, otp) => {
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "Email Verification OTP - House of Return Gift",

      html: `
        <div style="font-family:sans-serif;padding:20px;max-width:500px;margin:auto">
          <h2 style="color:#f59e0b">House of Return Gift</h2>

          <p>Your OTP for registration is:</p>

          <div style="background:#1f2937;padding:16px;border-radius:8px;text-align:center;margin:16px 0">
            <span style="font-size:32px;font-weight:bold;color:#f59e0b;letter-spacing:8px">${otp}</span>
          </div>

          <p style="color:#666;font-size:12px">This OTP will expire in 5 minutes.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
          <p style="color:#666;font-size:13px">Need help? Contact us on WhatsApp: <a href="https://wa.me/919917078468" style="color:#25D366;text-decoration:none;font-weight:bold">+91 9917078468</a></p>
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
