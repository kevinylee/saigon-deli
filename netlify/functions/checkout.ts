import Purchaseable from '../../src/models/Purchaseable';
import { supabase, stripe } from "../lib/clients";
import AppHandler from "../lib/app-handler";

const DOMAIN = process.env.BASE_URL;
const STRIPE_TAX_RATE_ID = process.env.STRIPE_TAX_RATE_ID;

const headers = {
  'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST'
}

interface LineItem {
  purchaseable: Purchaseable;
  quantity: number;
}

const validatePurchaseable = async (purchaseable: Purchaseable) => {
  const variantResponse = await supabase.from('Variants').select(`
    *,
    Items (
     *,
     ItemAddOns (*, AddOns (*)),
     ItemSizes (*, Sizes (*))
    )
  `).eq('id', purchaseable.variant.id).limit(1).single();

  if (!variantResponse) {
    throw new Error('Invalid Variant!');
  }

  const variant = variantResponse.data;
  const item = variant.Items;

  const addOns = item.ItemAddOns.filter((dbAddOn) => purchaseable.itemAddOns.find((proposedAddOn) => proposedAddOn.id === dbAddOn.id));
  const size = item.ItemSizes.find((dbSize) => dbSize.id === purchaseable.itemSize.id);

  if (!size)
    throw new Error('Invalid size provided');

  if (addOns.length !== purchaseable.itemAddOns.length)
    throw new Error('Invalid add ons provided');

  return new Purchaseable(variant, size, addOns, null);
};

const handler = AppHandler(async ({ event }) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers
    }
  }

  if (!event.body) {
    console.log(event)
    throw new Error("No checkout body attached.");
  }

  const { lineItems, pickupTime } = JSON.parse(event.body);

  const stripeLineItems = await Promise.all(lineItems
    .filter((lineItem: LineItem) => lineItem.quantity > 0)
    .map(async (lineItem: LineItem) => {
      const purchaseable = await validatePurchaseable(lineItem.purchaseable);

      // Tip quantity represents dollars (e.g. 3.50 = $3.50), convert to cents for Stripe
      if (purchaseable.variant.title === 'Tip') {
        return {
          price_data: {
            currency: 'USD',
            unit_amount: Math.round(lineItem.quantity * 100),
            product_data: { name: 'Tip' }
          },
          quantity: 1
        };
      }

      const sizePrefix = purchaseable.itemSize.Sizes.title !== 'One Size' ? purchaseable.itemSize.Sizes.title : "";
      const description = purchaseable.itemAddOns.length > 0 ? purchaseable.itemAddOns.map((itemAddOn) => itemAddOn.AddOns.title).toString() : undefined;

      return {
        price_data: {
          currency: 'USD',
          unit_amount: purchaseable.unitPrice,
          product_data: {
            name: `${sizePrefix} ${purchaseable.variant.title}`,
            description: description,
            metadata: {
              hash: purchaseable.hash,
            }
          }
        },
        quantity: lineItem.quantity,
        tax_rates: [STRIPE_TAX_RATE_ID]
      };
    }));

  const session = await stripe.checkout.sessions.create({
    line_items: stripeLineItems,
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
});

export { handler };