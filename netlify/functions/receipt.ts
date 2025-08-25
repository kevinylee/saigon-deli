import { Handler } from "@netlify/functions";
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET) {
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
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Unavailable HTTP method. GET required on this path."
      }),
      headers: headers
    }
  }

  if (!event.queryStringParameters) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "No session id provided."
      }),
      headers: headers
    }
  }

  const sessionId = event.queryStringParameters['sessionId'] as string

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
  const lineItemPayload = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ["data.price.product"] })

  console.log(checkoutSession)

  return {
    statusCode: 200,
    body: JSON.stringify({
      lineItems: lineItemPayload.data,
      pickupTime: checkoutSession.metadata?.pickup_time
    }),
    headers: headers
  }
}

export { handler };