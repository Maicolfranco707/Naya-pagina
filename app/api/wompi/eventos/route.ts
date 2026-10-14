import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/server";
import { sendPaymentApprovedEmails } from "@/utils/email/order-emails";

export const runtime = "nodejs";

interface WompiEvent {
  event?: string;
  environment?: string;
  timestamp?: number;
  data?: { transaction?: Record<string, unknown> };
  signature?: { properties?: string[]; checksum?: string };
}

function valueAtPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
}

function checksumMatches(expected: string, provided: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(expected) || !/^[a-f0-9]{64}$/i.test(provided)) return false;
  const expectedBytes = Buffer.from(expected, "hex");
  const providedBytes = Buffer.from(provided, "hex");
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export async function POST(request: Request) {
  let event: WompiEvent;
  try {
    event = await request.json() as WompiEvent;
  } catch {
    return NextResponse.json({ error: "Invalid event body." }, { status: 400 });
  }

  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "";
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET ?? "";
  const expectedPrefix = publicKey.startsWith("pub_test_")
    ? "test_events_"
    : publicKey.startsWith("pub_prod_")
      ? "prod_events_"
      : "";
  const signature = event.signature;
  const properties = signature?.properties;
  const providedChecksum = request.headers.get("x-event-checksum") ?? signature?.checksum ?? "";

  if (
    !expectedPrefix ||
    !eventsSecret.startsWith(expectedPrefix) ||
    !Array.isArray(properties) ||
    properties.length === 0 ||
    !Number.isInteger(event.timestamp) ||
    !providedChecksum
  ) {
    return NextResponse.json({ error: "Wompi events are not configured correctly." }, { status: 503 });
  }

  const signedValues = properties.map((property) => valueAtPath(event.data, property));
  if (signedValues.some((value) => value === undefined || value === null)) {
    return NextResponse.json({ error: "Event signature properties are incomplete." }, { status: 400 });
  }

  const calculatedChecksum = createHash("sha256")
    .update(`${signedValues.map(String).join("")}${event.timestamp}${eventsSecret}`)
    .digest("hex");

  if (!checksumMatches(calculatedChecksum, providedChecksum)) {
    return NextResponse.json({ error: "Invalid Wompi event signature." }, { status: 401 });
  }

  if (event.environment !== (expectedPrefix === "test_events_" ? "test" : "prod")) {
    return NextResponse.json({ error: "Wompi event environment does not match this deployment." }, { status: 400 });
  }

  if (event.event !== "transaction.updated") return NextResponse.json({ received: true });

  const transaction = event.data?.transaction;
  const reference = transaction?.reference;
  const transactionId = transaction?.id;
  const amountInCents = transaction?.amount_in_cents;
  const status = transaction?.status;
  const paymentStatus: Record<string, string> = {
    APPROVED: "approved",
    DECLINED: "declined",
    VOIDED: "voided",
    ERROR: "error",
    PENDING: "pending",
  };

  if (
    typeof reference !== "string" ||
    typeof transactionId !== "string" ||
    !Number.isInteger(amountInCents) ||
    typeof status !== "string" ||
    !paymentStatus[status]
  ) {
    return NextResponse.json({ error: "Wompi transaction data is invalid." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus[status],
        payment_transaction_id: transactionId,
        order_status: status === "APPROVED" ? "processing" : "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .eq("total_cop", Number(amountInCents) / 100)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Could not update payment status:", error.message);
      return NextResponse.json({ error: "Could not update order payment status." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "No matching order found for Wompi transaction." }, { status: 404 });
    }

    if (status === "APPROVED") {
      await sendPaymentApprovedEmails(data.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Supabase admin access is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}