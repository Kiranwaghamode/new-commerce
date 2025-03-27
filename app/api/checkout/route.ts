import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //@ts-ignore
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "INR",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),  // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
