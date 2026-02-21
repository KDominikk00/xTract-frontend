import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth";
import { getCustomerIdForUser } from "@/lib/server/billing";
import { createStripeBillingPortalSession } from "@/lib/server/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerIdForUser(user.id);
    if (!customerId) {
      return NextResponse.json({ error: "No billing account found." }, { status: 404 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const portal = await createStripeBillingPortalSession({
      customerId,
      returnUrl: `${origin}/`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json({ error: "Unable to open billing portal." }, { status: 500 });
  }
}
