import { Handler } from "@netlify/functions";
import Stripe from 'stripe';
import Variants from '../../catalog/variants.json';
import AddOns from '../../catalog/add-ons.json';
import Sizes from '../../catalog/sizes.json';
import Purchaseable from '../../src/models/Purchaseable';

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

enum SizeType {
  OneSize = "one-size",
  Small = "small",
  Large = "large"
}

enum AddOnType {
  ExtraMeat = "extra-meat",
  AddEgg = "add-egg"
}

// Add-ons and sizes are modifications to the order 
interface Size {
  id: SizeType;
  extraCost: number | null;
}

interface AddOn {
  id: AddOnType;
  extraCost: number | null;
}

// interface Variant {
//   id: string;
//   title: string;
//   description: string;
//   sizeOptions: SizeType[]
//   addOnOptions: AddOnType[];
//   available: boolean;
//   basePrice: boolean;
// }

// interface Purchaseable {
//   variant: Variant;
//   size: Size;
//   addOns: AddOn[];
// }

interface LineItem {
  purchaseable: Purchaseable;
  quantity: number;
}

const PRETTY = {
  [AddOnType.ExtraMeat]: "Extra Meat",
  [AddOnType.AddEgg]: "Add Egg",
  [SizeType.Small]: "Small",
  [SizeType.Large]: "Large",
  [SizeType.OneSize]: ""
}

const validatePurchaseable = (purchaseable: Purchaseable) => {
  const variant = Variants.find((variant) => variant.id === purchaseable.variant.id);
  const addOns = purchaseable.addOns.map((proposedAddOn) => AddOns.find((addOn) => proposedAddOn.id === addOn.id)).filter(Object);
  const size = Sizes.find((size) => size.id === purchaseable.size.id)

  // TODO: Grab the add-on price and size price according to the item

  return new Purchaseable(variant, size, addOns, null);
};

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

  const stripePayload = lineItems.map((lineItem: LineItem) => {
    const purchaseable = validatePurchaseable(lineItem.purchaseable);

    const sizeId = purchaseable.size?.id || SizeType.OneSize;
    const description = purchaseable.addOns.length > 0 ? purchaseable.addOns.map((addOn) => PRETTY[addOn.id]).join(', ') : undefined;

    const obj = {
      price_data: {
        currency: 'USD',
        unit_amount: purchaseable.unitPrice,
        product_data: {
          name: `${PRETTY[sizeId]} ${purchaseable.variant.title}`,
          description: description,
          metadata: {
            add_ons: purchaseable.addOns.toString()
          }
        }
      },
      quantity: lineItem.quantity
    };

    return obj;
  })

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