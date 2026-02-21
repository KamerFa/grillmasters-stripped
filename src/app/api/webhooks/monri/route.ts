import { NextResponse } from "next/server";
import { verifyWebhookDigest } from "@/lib/monri";
import { updatePaymentStatus, getOrderByNumber } from "@/services/order.service";

export async function POST(request: Request) {
  try {
    const body = await request.formData();

    const orderNumber = body.get("order_number") as string;
    const amount = Number(body.get("amount"));
    const currency = body.get("currency") as string;
    const digest = body.get("digest") as string;
    const responseCode = body.get("response_code") as string;
    const transactionId = body.get("id") as string;

    if (!orderNumber || !digest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify webhook digest
    const isValid = verifyWebhookDigest(
      orderNumber,
      amount,
      currency,
      digest
    );

    if (!isValid) {
      console.error("Invalid Monri webhook digest");
      return NextResponse.json(
        { error: "Invalid digest" },
        { status: 403 }
      );
    }

    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const isApproved = responseCode === "0000";
    const paymentStatus = isApproved ? "CAPTURED" : "FAILED";

    await updatePaymentStatus(order.id, paymentStatus as "CAPTURED" | "FAILED", {
      monriTransactionId: transactionId,
      monriResponseCode: responseCode,
      monriOrderNumber: orderNumber,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Monri webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
