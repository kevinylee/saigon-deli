import { Handler } from "@netlify/functions";
import Stripe from 'stripe';

const DOMAIN = process.env.BASE_URL;

if (!process.env.STRIPE_SECRET || !DOMAIN) {
  throw "No Stripe API key or base URL founded.";
}

const stripe = new Stripe(process.env.STRIPE_SECRET, { 
  apiVersion: "2022-08-01"
});

const headers = {
  'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST'
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers
    }
  }

  if (!event.body) {
    console.log(event)
    throw "No request body attached.";
  }

  const { lineItems } = JSON.parse(event.body);

  const stripeRequest = lineItems.map(lineItem => (
    {
      price: lineItem.itemId, // itemId is the priceId
      quantity: lineItem.quantity
    }));

  const session = await stripe.checkout.sessions.create({
    line_items: stripeRequest,
    mode: 'payment',
    success_url: `${DOMAIN}/receipt?success=true&id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}`,
    phone_number_collection: {
      enabled: true
    }
  });

  return {
    headers: headers,
    statusCode: 200,
    body: JSON.stringify(
      {
        sessionId: session.id,
      }
    )
  }
}

export { handler };