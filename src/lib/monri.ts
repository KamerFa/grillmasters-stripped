import crypto from "crypto";

const MONRI_API_URL =
  process.env.MONRI_API_URL ?? "https://ipgtest.monri.com";
const MONRI_MERCHANT_KEY = process.env.MONRI_MERCHANT_KEY ?? "";
const MONRI_AUTHENTICITY_TOKEN = process.env.MONRI_AUTHENTICITY_TOKEN ?? "";

interface CreatePaymentParams {
  amount: number;
  currency: string;
  orderNumber: string;
  orderInfo: string;
  language: string;
  fullName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

interface MonriPaymentResponse {
  status: string;
  id: string;
  client_secret: string;
}

function createAuthorizationHeader(
  fullpath: string,
  body: string
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const digestInput = `${MONRI_MERCHANT_KEY}${timestamp}${MONRI_AUTHENTICITY_TOKEN}${fullpath}${body}`;
  const digest = crypto.createHash("sha512").update(digestInput).digest("hex");
  return `WP3-v2.1 ${MONRI_AUTHENTICITY_TOKEN} ${timestamp} ${digest}`;
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<MonriPaymentResponse> {
  const fullpath = "/v2/payment/new";
  const body = JSON.stringify({
    transaction_type: "authorize",
    amount: params.amount,
    currency: params.currency,
    order_number: params.orderNumber,
    order_info: params.orderInfo,
    language: params.language,
    ch_full_name: params.fullName,
    ch_address: params.address,
    ch_city: params.city,
    ch_zip: params.zip,
    ch_country: params.country,
    ch_phone: params.phone,
    ch_email: params.email,
  });

  const authorization = createAuthorizationHeader(fullpath, body);

  const response = await fetch(`${MONRI_API_URL}${fullpath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Monri payment creation failed: ${response.statusText}`);
  }

  return response.json();
}

export function verifyWebhookDigest(
  orderNumber: string,
  amount: number,
  currency: string,
  receivedDigest: string
): boolean {
  const digestInput = `${MONRI_MERCHANT_KEY}${orderNumber}${amount}${currency}`;
  const expectedDigest = crypto
    .createHash("sha512")
    .update(digestInput)
    .digest("hex");
  return expectedDigest === receivedDigest;
}

export async function capturePayment(
  orderNumber: string,
  amount: number,
  currency: string
): Promise<void> {
  const fullpath = `/transactions/${orderNumber}/capture.xml`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<transaction>
  <amount>${amount}</amount>
  <currency>${currency}</currency>
</transaction>`;

  const authorization = createAuthorizationHeader(fullpath, body);

  const response = await fetch(`${MONRI_API_URL}${fullpath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      Authorization: authorization,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Monri capture failed: ${response.statusText}`);
  }
}

export async function refundPayment(
  orderNumber: string,
  amount: number,
  currency: string
): Promise<void> {
  const fullpath = `/transactions/${orderNumber}/refund.xml`;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<transaction>
  <amount>${amount}</amount>
  <currency>${currency}</currency>
</transaction>`;

  const authorization = createAuthorizationHeader(fullpath, body);

  const response = await fetch(`${MONRI_API_URL}${fullpath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      Authorization: authorization,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Monri refund failed: ${response.statusText}`);
  }
}
