import { Resend } from "resend";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}
const fromEmail = process.env.EMAIL_FROM ?? "noreply@shop.ba";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }

  await getResendClient().emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });
}

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  total: string,
  items: { name: string; quantity: number; price: string }[]
) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.price}</td></tr>`
    )
    .join("");

  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a1a1a">Thank you for your order!</h1>
        <p>Order number: <strong>${orderNumber}</strong></p>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:left">Qty</th>
              <th style="padding:8px;text-align:left">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-size:18px;font-weight:bold;margin-top:16px">Total: ${total}</p>
        <p>We will notify you when your order has been shipped.</p>
      </div>
    `,
  });
}

export async function sendShippingNotification(
  email: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl?: string
) {
  const trackingLink = trackingUrl
    ? `<p><a href="${trackingUrl}">Track your shipment</a></p>`
    : `<p>Tracking number: <strong>${trackingNumber}</strong></p>`;

  await sendEmail({
    to: email,
    subject: `Your order ${orderNumber} has been shipped`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a1a1a">Your order is on its way!</h1>
        <p>Order number: <strong>${orderNumber}</strong></p>
        ${trackingLink}
      </div>
    `,
  });
}
