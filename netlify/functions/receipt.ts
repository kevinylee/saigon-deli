import { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe';

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials found.";
}

if (!process.env.STRIPE_SECRET) {
  throw "No Stripe credentials found.";
}

const supabaseUrl = process.env.SUPABASE_API_URL
const supabaseKey = process.env.SUPABASE_PRIVATE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: "2022-08-01"
});

const headers = {
  'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST'
}

const normalizeLineItem = (lineItem: any) => {
  if (lineItem.description !== undefined) {
    return lineItem;
  }

  return {
    quantity: lineItem.quantity,
    description: lineItem.title,
    amount_total: lineItem.amount_total,
    price: {
      product: {
        description: lineItem.addOns
      }
    }
  };
}

const getReceiptData = async (sessionId: string) => {
  const { data } = await supabase
    .from('Orders')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (data) {
    const normalizedLineItems = data.array_line_items.map(normalizeLineItem);
    return [normalizedLineItems, data.pickup_at];
  } else {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    const lineItemPayload = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ["data.price.product"] })

    const normalizedLineItems = lineItemPayload.data.map(normalizeLineItem);
    return [normalizedLineItems, checkoutSession.metadata?.pickup_time]
  }
}

const handler: Handler = async ({ httpMethod, queryStringParameters }, context) => {
  if (httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: headers
    }
  }

  if (!queryStringParameters?.['sessionId']) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "No session id provided."
      }),
      headers: headers
    }
  }

  const sessionId = queryStringParameters['sessionId'];

  try {
    const [lineItems, pickupTime] = await getReceiptData(sessionId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        lineItems,
        pickupTime
      }),
      headers: headers
    }

  } catch {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Order not found"
      }),
      headers: headers
    }
  }
}

export { handler };