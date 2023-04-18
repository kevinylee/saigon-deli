import { Handler } from "@netlify/functions";
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'

if (!process.env.STRIPE_SECRET) {
  throw "No Stripe API key or base URL found.";
}

if (!process.env.GATSBY_SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials founded.";
}

const supabaseUrl = process.env.GATSBY_SUPABASE_API_URL
const supabaseKey = process.env.SUPABASE_PRIVATE_KEY

const ENDPOINT_SECRET = process.env.WEBHOOK_ENDPOINT_SECRET;

if (!ENDPOINT_SECRET) {
  throw "No webhook endpoint secret found."
}

const stripe = new Stripe(process.env.STRIPE_SECRET, { 
  apiVersion: "2022-08-01"
});

const supabase = createClient(supabaseUrl, supabaseKey)

const handler: Handler = async (event, context) => {
  console.log("We out here!")

  if (event.httpMethod !== 'POST') {
    console.log(event);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Invalid HTTP method."
      })
    }
  }

  const payload = event.body!;
  const sig = event.headers['stripe-signature']!;

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(payload, sig, ENDPOINT_SECRET);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Webhook Error: ${err.message}`
      })
    }    
  }

    // Handle the checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
      console.log('Getting session completed!')
      const session = stripeEvent.data.object as Stripe.Checkout.Session;

      let { name, phone } = session.customer_details!;

      if (!name || !phone) {
        name = "No customer name."
        phone = "No phone number."
      }

      const stripe_line_items_response = await stripe.checkout.sessions.listLineItems(session.id)

      const array_line_items: any[] = [];
      const line_items = {};

      console.log(stripe_line_items_response);

      stripe_line_items_response.data.forEach(line_item => {
        array_line_items.push({
          title: line_item.description,
          quantity: line_item.quantity
        });

        line_items[`${line_item.quantity}-${line_item.description}`] = {
          title: line_item.description,
          quantity: line_item.quantity
        };
      });

      // Fulfill the purchase...
      const { data, error } = await supabase.from('Orders').insert([
        { 
          line_items: line_items, 
          total_amount: session.amount_total, 
          customer_name: name, 
          array_line_items: array_line_items,
          phone_number: phone
        }
      ]);

      console.log(data);
      console.log(error)
    }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Order completed."
    })
  }
}

export { handler };