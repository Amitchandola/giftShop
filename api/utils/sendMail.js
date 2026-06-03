
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

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
    <p><strong>Cart Value:</strong> ₹${orderDetails.cartTotal}</p>
    <p><strong>Delivery Charges:</strong> ₹${orderDetails.deliveryCharge}${orderDetails.cartTotal >= 799 ? ' (50% off)' : ''}</p>
    <p style="font-size:18px"><strong>Total Amount:</strong> ₹${orderDetails.totalPrice}</p>
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
      subject: "✅ Order Confirmation - House of Return Gift",
      html: `
        <h2 style="color:#f59e0b">House of Return Gift</h2>

        <p>Dear ${orderDetails.userName},</p>

        <p>Your order has been placed successfully. 🎉</p>

        <table style="border-collapse:collapse;margin:16px 0;font-size:14px">
          <tr><td style="padding:4px 12px 4px 0">Cart Value:</td><td style="font-weight:bold">₹${orderDetails.cartTotal}</td></tr>
          <tr><td style="padding:4px 12px 4px 0">Delivery Charges:</td><td style="font-weight:bold;color:${orderDetails.cartTotal >= 799 ? '#16a34a' : '#333'}">₹${orderDetails.deliveryCharge}${orderDetails.cartTotal >= 799 ? ' (50% off)' : ''}</td></tr>
          <tr><td style="padding:8px 12px 4px 0;border-top:1px solid #e5e7eb;font-size:16px"><strong>Total Amount:</strong></td><td style="padding-top:8px;border-top:1px solid #e5e7eb;font-size:16px;font-weight:bold;color:#f59e0b">₹${orderDetails.totalPrice}</td></tr>
        </table>

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
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p style="color:#666;font-size:13px">Need help? Contact us on WhatsApp: <a href="https://wa.me/919917078468" style="color:#25D366;text-decoration:none;font-weight:bold">+91 9917078468</a></p>
      `,
    };

    await transporter.sendMail(ownerMail);
    await transporter.sendMail(customerMail);

    console.log("Owner + Customer mail sent successfully");
    return true;
  } catch (error) {
    console.error("Mail sending failed");
    return false;
  }
};

export default sendOrderMails;
