
import nodemailer from "nodemailer";

const sendOrderMails = async (orderDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Mail to Owner
    const ownerMail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🛒 New Order Received",

      html: `
    <h2>New Order Alert</h2>

    <p><strong>Customer:</strong> ${orderDetails.userName}</p>
    <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
    <p><strong>Mobile Number:</strong> ${orderDetails.phoneNumber}</p>
    <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
    <p><strong>Address:</strong> ${orderDetails.address}</p>

    <p><strong>Transaction ID:</strong> ${orderDetails.transactionId}</p>

    <p><strong>Products:</strong></p>
    <ul>
      ${orderDetails.items
        .map(
          (item) =>
            `<li>${item.title} - Qty: ${item.qty} - ₹${item.price}</li>`,
        )
        .join("")}
    </ul>
  `,

      attachments: orderDetails.paymentScreenshot
        ? [
            {
              filename: orderDetails.paymentScreenshot,
              path: `uploads/${orderDetails.paymentScreenshot}`,
            },
          ]
        : [],
    };

    // ✅ Mail to Customer
    const customerMail = {
      from: process.env.EMAIL_USER,
      to: orderDetails.customerEmail,
      subject: "✅ Order Confirmation - returnGift.com",
      html: `
        <h2>Thank You for Your Order 🎉</h2>

        <p>Dear ${orderDetails.userName},</p>

        <p>Your order has been placed successfully.</p>

        <p><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>

        <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
        <p><strong>Transaction ID:</strong> ${orderDetails.transactionId}</p>

<p>
  <strong>Payment Screenshot:</strong><br/>
  <img
    src="${process.env.APP_URL || 'http://localhost:1000'}/uploads/${orderDetails.paymentScreenshot}"
    width="300"
  />
</p>

        <p>We will process your order soon.</p>

        <br />

        <p>Thank you for shopping with us ❤️</p>
      `,
    };

    await transporter.sendMail(ownerMail);
    await transporter.sendMail(customerMail);

    console.log("Owner + Customer mail sent successfully");
    return true;
  } catch (error) {
    console.log("Mail Error:", error.message);
    return false;
  }
};

export default sendOrderMails;
