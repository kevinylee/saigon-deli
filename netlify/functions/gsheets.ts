import { Handler } from "@netlify/functions";
import Stripe from 'stripe';

// Spring rolls
// Spring rolls with Shrimp
// Spring rolls with Chicken
// Spring rolls with Tofu
// Banh Mi
// Banh Mi with BBQ Pork: true
// Bank Mi with Chicken: true
// Banh Mi with Tofu: true
// Banh Mi with BBQ Pork and egg: true
// Bank Mi with Chicken and egg: true
// Banh Mi with Tofu and egg: done

// Chowmein with vegetables & chicken
// Chowmein with vegetables & beef
// Chowmein with vegetables & pork

// Chowfun with vegetables & chicken
// Chowfun with vegetables & beef
// Chowfun with vegetables & pork

// Chowmein with vegetables & seafood
// Chowmein with vegetables & shrimp

// Special rice with Chicken
// Special rice with Beef
// Special rice with Tofu
// Special rice with Pork

// In Stripe, each have individual menu items
// The child menu items are options
// The parent is the overarching item
// On Stripe, the parent will have children: ["priceId", "priceId"]
// In gsheets, we will return the parent item. 
// Then attach the child items (with their prices)
// In the frontend we'll parse that out easily
// - Only display parent
// - Use modal and represent the child options (they have individual prices)

const DOMAIN = process.env.BASE_URL;

if (!process.env.STRIPE_SECRET || !DOMAIN) {
  throw "No Stripe API key or base URL founded.";
}

const stripe = new Stripe(process.env.STRIPE_SECRET, { 
  apiVersion: "2022-08-01"
});

interface ResponseItem {
    ProductId: string;
    PriceId: string;
    SmallPriceId: string | null;
    LargePriceId: string | null;
    Title: string;
    Description: string | null;
    Category: string;
    Price: string | null;
    SmallPrice: string | null;
    LargePrice: string | null;
    Status: string | null;
    ProductOptions: ResponseItemOption[];
};

interface ResponseItemOption {
  Title: string; // The title of the option
  PriceId: string; // the price id itself
  Price: string; // the price string 
}

const handler: Handler = async (event, context) => {
  let productsResponse = await stripe.products.list({
    expand: ["data.default_price"],
    active: true
  });
  let products = productsResponse.data;

  while (productsResponse.has_more) {
    productsResponse = await stripe.products.list({
      starting_after: products[products.length - 1].id,
      expand: ["data.default_price"],
      active: true
    })

    products = products.concat(productsResponse.data)
  }

    console.log('HELLO!')

    const merged: ResponseItem[] = [];

    // Combining Stripe products into something readable for the frontend
    products.forEach(product => {
      if (!product.metadata['isOption']) {
        let Title = product.name;
        // console.log(Title);

        const rawPrice = (product.default_price as Stripe.Price).unit_amount!
        const Price = `$${(rawPrice / 100).toFixed(2)}`;
        const currentPriceId = ((product.default_price as Stripe.Price).id as string);

        if (product.name.includes("Large") || product.name.includes("Small")) {
          const isSmall = product.name.includes("Small")

          Title = Title.replaceAll("(Small)", "");
          Title = Title.replaceAll("(Large)", "");

          const itemExists = merged.findIndex((item) => product.name.includes(item.Title));

          if (itemExists > -1) {
            const original = merged[itemExists]

            merged[itemExists] = {
              ...original,
              ...(isSmall ? {SmallPrice: Price, SmallPriceId: currentPriceId} : { LargePrice: Price, LargePriceId: currentPriceId })
            }

            return;
          } else {
            merged.push({
              ProductId: product.id,
              PriceId: ((product.default_price as Stripe.Price).id as string),
              Title,
              Description: product.description,
              Price: null,
              Status: product.metadata["status"],
              Category: product.metadata['category'],
              ...(isSmall ? { SmallPrice: Price, LargePrice: null, SmallPriceId: currentPriceId, LargePriceId: null } : { LargePrice: Price, SmallPrice: null, SmallPriceId: null, LargePriceId: currentPriceId }),
              ProductOptions: []
            });

            return;
          }
        }

        const productOptions = product.metadata['options'];
        let options: any[] = [];

        if (productOptions) {
          let rawIds = productOptions.split(",");
          console.log(rawIds);

          rawIds.forEach(async (id) => {
            const productChild = products.find((product) => product.id == id);

            if (!productChild) {
              throw Error("This is a bad error");
            }

            const rawPrice = (productChild.default_price as Stripe.Price).unit_amount!
            const Price = `$${(rawPrice / 100).toFixed(2)}`;

            const formatted: ResponseItemOption = {
              Title: productChild.name,
              PriceId: ((productChild.default_price as Stripe.Price).id as string),
              Price: Price
            }

            options.push(formatted);
          });
        }

        merged.push({
          ProductId: product.id,
          PriceId:  ((product.default_price as Stripe.Price).id as string),
          Title,
          Description: product.description,
          Price,
          SmallPrice: null,
          LargePrice: null,
          SmallPriceId: null,
          LargePriceId: null,
          Status: product.metadata["status"],
          Category: product.metadata['category'],
          ProductOptions: options
        });
      }
    });

    // for pho, each item should have a largePrice and smallPrice field
    // also description field
    // Title, Price, Description, SmallPrice, LargePrice

    merged.sort((a, b) => {
      return a.Title.localeCompare(b.Title);
    })

    // hard coded. new categories will not be accounted for.
    const appetizers = merged.filter(item => item.Category === "Appetizers");
    const pho = merged.filter(item => item.Category === "Pho");
    const bun = merged.filter(item => item.Category === "Bun");
    const vegetarian = merged.filter(item => item.Category === "Vegetarian");
    const banhcanh = merged.filter(item => item.Category === "Banh Canh");
    const hutieu = merged.filter(item => item.Category === "Hu Tieu");
    const stirfried = merged.filter(item => item.Category === "Stir Fried Noodle");
    const ricedishes = merged.filter(item => item.Category === "Rice Dishes");
    const friedrice = merged.filter(item => item.Category === "Fried Rice");
    const soursoup = merged.filter(item => item.Category === "Sour Soup");
    const beverage = merged.filter(item => item.Category === "Beverage");

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        Appetizers: appetizers, 
        Pho: pho, 
        Bun: bun, 
        Vegetarian: vegetarian, 
        BanhCanh: banhcanh, 
        HuTieu: hutieu, 
        StirFried: stirfried, 
        RiceDishes: ricedishes, 
        FriedRice: friedrice, 
        SourSoup: soursoup, 
        Beverage: beverage, 
        Restaurant: {
          Weekdays: "11am-8pm",
          Weekends: "11:30am-8pm",
          Phone: "(206) 634-2866",
          Notice: "",
          Catering: "Don't forget to ask us about our catering service for your event or party."
        }
      })
    };
};

export { handler };