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

const PRETTY = {
  "extra-meat": "Extra Meat",
  "add-egg": "Add Egg",
  "small": "Small",
  "large": "Large",
  "one-size": ""
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

  const { lineItems, pickupTime } = JSON.parse(event.body);

  console.log(pickupTime);

  const stripePayload = lineItems.map((lineItem) => {
    // FIND THE RIGHT LINE ITEM IN OUR MENU
    // Get the unit amount there
    const sizeId = lineItem.purchaseable.size?.id || 'one-size';
    const description = lineItem.purchaseable.addOns.length > 0 ? lineItem.purchaseable.addOns.map((addOn) => PRETTY[addOn.id]).join(', ') : undefined;

    const obj = {
      price_data: {
        currency: 'USD',
        unit_amount: lineItem.unitPrice,
        product_data: {
          name: `${PRETTY[sizeId]} ${lineItem.purchaseable.variant.title}`,
          description: description,
          metadata: {
            add_ons: lineItem.purchaseable.addOns.toString()
          }
        }
      },
      quantity: lineItem.quantity
    };

    return obj;
  })

  // Look up item by itemID
  // Apply everything onto the base price

  // const stripeRequest = lineItems.map(lineItem => (
  //   {
  //     price: lineItem.itemId, // itemId is the priceId
  //     quantity: lineItem.quantity
  //   }));

  const stripeRequest = [
    {
      price_data: {
        currency: 'USD',
        unit_amount: 100,
        product_data: {
          name: "Banh Mi with Beef",
          description: "Extra Meat, Add Egg",
          metadata: {
            add_ons: "blah"
          }
        }
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: 'USD',
        unit_amount: 100,
        product_data: {
          name: "Pho with Tofu",
          description: "Extra Meat, Add Egg",
          metadata: {
            add_ons: "blah"
          }
        }
      },
      quantity: 4,
    }
  ]

  // TRACK pickup time in metadata?

  const session = await stripe.checkout.sessions.create({
    line_items: stripePayload,
    metadata: {
      pickup_time: pickupTime
    },
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