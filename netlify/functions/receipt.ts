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
    amount_subtotal: lineItem.unit_price * lineItem.quantity,
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
    const taxRow = data.array_line_items.find((li: any) => li.title === 'Sales Tax');
    const tipRow = data.array_line_items.find((li: any) => li.title === 'Tip');
    const tax = taxRow?.amount_total ?? 0;
    const tip = tipRow?.amount_total ?? 0;
    const itemsOnly = data.array_line_items.filter((li: any) =>
      li.title !== 'Sales Tax' && li.title !== 'Tip'
    );
    const normalizedLineItems = itemsOnly.map(normalizeLineItem);
    return [normalizedLineItems, data.pickup_at, tax, tip];
  } else {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const lineItemPayload = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ["data.price.product"] });

    const tipItem = lineItemPayload.data.find((li) => li.description === 'Tip');
    const tip = tipItem?.amount_total ?? 0;
    const foodOnly = lineItemPayload.data.filter((li) => li.description !== 'Tip');
    const normalizedLineItems = foodOnly.map(normalizeLineItem);
    const tax = checkoutSession.total_details?.amount_tax ?? 0;
    return [normalizedLineItems, checkoutSession.metadata?.pickup_time, tax, tip];
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
    const [lineItems, pickupTime, tax, tip] = await getReceiptData(sessionId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        lineItems,
        pickupTime,
        tax,
        tip
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