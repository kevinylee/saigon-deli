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

// if (!process.env.STRIPE_SECRET || !DOMAIN) {
//   throw "No Stripe API key or base URL founded.";
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET, { 
//   apiVersion: "2022-08-01"
// });

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
  // let productsResponse = await stripe.products.list({
  //   expand: ["data.default_price"],
  //   active: true
  // });
  // let products = productsResponse.data;

  // while (productsResponse.has_more) {
  //   productsResponse = await stripe.products.list({
  //     starting_after: products[products.length - 1].id,
  //     expand: ["data.default_price"],
  //     active: true
  //   })

  //   products = products.concat(productsResponse.data)
  // }

  let products: any[] = [];

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
    // const appetizers = merged.filter(item => item.Category === "Appetizers");
    // const pho = merged.filter(item => item.Category === "Pho");
    // const bun = merged.filter(item => item.Category === "Bun");
    // const vegetarian = merged.filter(item => item.Category === "Vegetarian");
    // const banhcanh = merged.filter(item => item.Category === "Banh Canh");
    // const hutieu = merged.filter(item => item.Category === "Hu Tieu");
    // const stirfried = merged.filter(item => item.Category === "Stir Fried Noodle");
    // const ricedishes = merged.filter(item => item.Category === "Rice Dishes");
    // const friedrice = merged.filter(item => item.Category === "Fried Rice");
    // const soursoup = merged.filter(item => item.Category === "Sour Soup");
    // const beverage = merged.filter(item => item.Category === "Beverage");

    return {
      statusCode: 200,
      body: JSON.stringify({
        "Appetizers": [
            {
                "ProductId": "prod_MZt0iTPW59zC5z",
                "PriceId": "price_1LqjEYEWoyssAqHuBKFA5zfn",
                "Title": "1. Spring Rolls - Goi Cuon",
                "Description": "Rice vermicelli & lettuce rolled in fresh rice paper with your choice of Shrimp, Chicken, or Tofu. Served with peanut sauce.",
                "Price": "$5.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Appetizers",
                "ProductOptions": [
                    {
                        "Title": "Spring Rolls with Shrimp",
                        "PriceId": "price_1M21bqEWoyssAqHuVAEiG2JG",
                        "Price": "$5.50"
                    },
                    {
                        "Title": "Spring rolls with Chicken",
                        "PriceId": "price_1M21bqEWoyssAqHuL2xRpRNz",
                        "Price": "$5.50"
                    },
                    {
                        "Title": "Spring rolls with Tofu",
                        "PriceId": "price_1M21bqEWoyssAqHuVOqINjIm",
                        "Price": "$5.50"
                    }
                ]
            },
            {
                "ProductId": "prod_MZt00p8Mvet7La",
                "PriceId": "price_1LqjE4EWoyssAqHufcimMR6Z",
                "Title": "2. Vegetarian Egg Rolls",
                "Description": "Deep fried roll filled with tofu, noodles, onions, carrots, and taro. Served with fish sauce.",
                "Price": "$5.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Appetizers",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZt1iPdKb35Z1G",
                "PriceId": "price_1LqjF8EWoyssAqHuBy6u0rDA",
                "Title": "3. Vietnamese Sandwich (banh mi) ⭐",
                "Description": "Fresh baguette filled with shredded carrots, cucumbers, cilantro, and your choice of BBQ Pork, Chicken, or Tofu.",
                "Price": "$6.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Appetizers",
                "ProductOptions": [
                    {
                        "Title": "Banh Mi with BBQ Pork",
                        "PriceId": "price_1M0sm3EWoyssAqHuIqdUKNRP",
                        "Price": "$6.95"
                    },
                    {
                        "Title": "Banh Mi with Chicken",
                        "PriceId": "price_1M0smdEWoyssAqHuSSNrgFqJ",
                        "Price": "$6.95"
                    },
                    {
                        "Title": "Banh Mi with Tofu",
                        "PriceId": "price_1M0sn5EWoyssAqHuAUlSvB8d",
                        "Price": "$6.95"
                    },
                    {
                        "Title": "Banh Mi with BBQ Pork and egg",
                        "PriceId": "price_1M0sncEWoyssAqHuyqq99tHF",
                        "Price": "$7.70"
                    },
                    {
                        "Title": "Banh Mi with Tofu and egg",
                        "PriceId": "price_1M0soXEWoyssAqHusViXaVad",
                        "Price": "$7.70"
                    },
                    {
                        "Title": "Bank Mi with Chicken and egg",
                        "PriceId": "price_1M0snsEWoyssAqHug3fccD1T",
                        "Price": "$7.70"
                    }
                ]
            }
        ],
        "Pho": [
            {
                "ProductId": "prod_MZsrUKzgKoGNTx",
                "PriceId": "price_1Lqj66EWoyssAqHuBdWLlHTR",
                "Title": "10. Pho with tofu & vegetables ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$12.00",
                "LargePrice": "$12.75",
                "SmallPriceId": "price_1Lqj66EWoyssAqHuBdWLlHTR",
                "LargePriceId": "price_1LqitMEWoyssAqHuBVhX3fA6",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsoMgXh4ARC9L",
                "PriceId": "price_1Lqj2aEWoyssAqHuApc50pR1",
                "Title": "11. Special Pho (beef and meatballs) ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$13.25",
                "LargePrice": "$14.00",
                "SmallPriceId": "price_1Lqj2aEWoyssAqHuApc50pR1",
                "LargePriceId": "price_1LqiqREWoyssAqHup5RnyWb0",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsx6Rm4fdppBR",
                "PriceId": "price_1LqjBCEWoyssAqHuC2JjErKv",
                "Title": "4. Pho with beef ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$12.00",
                "LargePrice": "$12.75",
                "SmallPriceId": "price_1LqjBCEWoyssAqHuC2JjErKv",
                "LargePriceId": "price_1Lqj80EWoyssAqHuwFMzGOLN",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsw6hHVGRTQYs",
                "PriceId": "price_1LqjAxEWoyssAqHucwxQC9Nl",
                "Title": "5. Pho with chicken ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$12.00",
                "LargePrice": "$12.75",
                "SmallPriceId": "price_1LqjAxEWoyssAqHucwxQC9Nl",
                "LargePriceId": "price_1Lqj8QEWoyssAqHuNxX0xJO7",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsyf0NA365RaI",
                "PriceId": "price_1LqjCGEWoyssAqHuRoh9r57V",
                "Title": "6. Pho with meatballs ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$12.00",
                "LargePrice": "$12.75",
                "SmallPriceId": "price_1LqjCGEWoyssAqHuRoh9r57V",
                "LargePriceId": "price_1Lqj8EEWoyssAqHu8i1QLNEc",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZszPZ6p0fd0gX",
                "PriceId": "price_1LqjDlEWoyssAqHuggAuPB8N",
                "Title": "7. Pho with shrimp ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$13.25",
                "LargePrice": "$14.00",
                "SmallPriceId": "price_1LqjDlEWoyssAqHuggAuPB8N",
                "LargePriceId": "price_1Lqj9qEWoyssAqHuaT83mew2",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsvRrJF6KR9KD",
                "PriceId": "price_1Lqj9dEWoyssAqHuh74SPMjv",
                "Title": "8. Pho with seafood ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$13.25",
                "LargePrice": "$14.00",
                "SmallPriceId": "price_1Lqj9dEWoyssAqHuh74SPMjv",
                "LargePriceId": "price_1Lqj7VEWoyssAqHu2BDtxCfQ",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MaLXylsBJQzYiI",
                "PriceId": "price_1LrAqdEWoyssAqHu09DvUMCN",
                "Title": "9. Pho with wonton & beef ",
                "Description": null,
                "Price": null,
                "Category": "Pho",
                "SmallPrice": "$13.25",
                "LargePrice": "$14.00",
                "SmallPriceId": "price_1LrAqdEWoyssAqHu09DvUMCN",
                "LargePriceId": "price_1Lqj8bEWoyssAqHuJMRxs4I4",
                "ProductOptions": []
            }
        ],
        "Bun": [
            {
                "ProductId": "prod_MZsrea3t3mUzZa",
                "PriceId": "price_1Lqj5YEWoyssAqHurzZLLiBa",
                "Title": "12. Bun with charboiled pork & eggrolls",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsqi5yJllYVS9",
                "PriceId": "price_1Lqj4nEWoyssAqHutGYuPThA",
                "Title": "13. Bun with beef & eggrolls",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsgB97SBsrybY",
                "PriceId": "price_1LqivCEWoyssAqHu78HbZDmf",
                "Title": "14. Bun with chicken & eggrolls",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsgtRYSU3MrUE",
                "PriceId": "price_1LqiuyEWoyssAqHugpmZdGuz",
                "Title": "15. Bun with eggrolls",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsgXd0nUXHaLa",
                "PriceId": "price_1LqiuiEWoyssAqHu1Sjui94B",
                "Title": "16. Bun with seafood & eggrolls",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsqbaxjEm9zQG",
                "PriceId": "price_1Lqj4REWoyssAqHuQGp97xdl",
                "Title": "17. Bun with shrimp & eggrolls",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsfO5UvwUFBLx",
                "PriceId": "price_1LqiuPEWoyssAqHurNW5Uq9f",
                "Title": "18. Bun with shrimp, charboiled pork & eggrolls",
                "Description": null,
                "Price": "$15.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsgNUmKCI5n0r",
                "PriceId": "price_1LqivYEWoyssAqHuMkb96IEP",
                "Title": "19. Bun with shrimp, tofu & eggrolls",
                "Description": null,
                "Price": "$15.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Bun",
                "ProductOptions": []
            }
        ],
        "Vegetarian": [
            {
                "ProductId": "prod_MZsYJikpifJRPY",
                "PriceId": "price_1LqinlEWoyssAqHuFyNbg6n2",
                "Title": "21. Streamed rice w/ lemon grass tofu",
                "Description": null,
                "Price": "$12.75",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsY2nR63ELIar",
                "PriceId": "price_1LqinXEWoyssAqHuCQa2T7ee",
                "Title": "22. Fried rice w/ tofu & peas",
                "Description": null,
                "Price": "$12.75",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsZyOrHw78TTC",
                "PriceId": "price_1LqiobEWoyssAqHupX2ZZjZY",
                "Title": "23. Steamed rice w/ special spicy tofu",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZseZ9rNcvWQiI",
                "PriceId": "price_1Lqit0EWoyssAqHuf6ZStGSQ",
                "Title": "24. Steamed rice w/ eggplant & tofu",
                "Description": null,
                "Price": "$12.75",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsYbtjY7egcgp",
                "PriceId": "price_1Lqin9EWoyssAqHuyoIbxmmn",
                "Title": "25. Chowfun w/ tofu & vegetables",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsS7IrQQ8k1ib",
                "PriceId": "price_1LqihwEWoyssAqHuiTNV42pw",
                "Title": "26. Banh canh w/ tofu",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsUwFPDlzeA36",
                "PriceId": "price_1LqijEEWoyssAqHuDqtJcTSF",
                "Title": "27. Rice vermicelli w/ tofu & eggrolls",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZtRvEnSqPZwW8",
                "PriceId": "price_1LqjeGEWoyssAqHul4rtRVRj",
                "Title": "28. Rice noodle soup w/ vegetables & tofu",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZtRRyJ7Oq0e8y",
                "PriceId": "price_1LqjeOEWoyssAqHuqL05uqn0",
                "Title": "29. Special vegetarian noodle soup",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsTvNaaXLyv6g",
                "PriceId": "price_1LqiixEWoyssAqHuGwt1aTLj",
                "Title": "30. Hot and sour soup w/ tofu",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Vegetarian",
                "ProductOptions": []
            }
        ],
        "BanhCanh": [
            {
                "ProductId": "prod_MZsSJ5mGlNJz7w",
                "PriceId": "price_1LqihnEWoyssAqHu6nwDrRxZ",
                "Title": "31. Banh canh w/ chicken",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Banh Canh",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsQNLrOAMyMGN",
                "PriceId": "price_1LqifOEWoyssAqHum9XT5oI0",
                "Title": "32. Banh canh w/ beef",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Banh Canh",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsR9pN36OV8rV",
                "PriceId": "price_1LqigWEWoyssAqHukn0KdzIa",
                "Title": "33. Banh canh w/ pork",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Banh Canh",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsRpPdk2DpGqC",
                "PriceId": "price_1LqigbEWoyssAqHutcUHhzpA",
                "Title": "34. Banh canh w/ shrimp",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Banh Canh",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZsRSFhX6T0Lna",
                "PriceId": "price_1LqigYEWoyssAqHus9MBExNi",
                "Title": "35. Banh canh w/ seafood",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Banh Canh",
                "ProductOptions": []
            }
        ],
        "HuTieu": [
            {
                "ProductId": "prod_MZakHPKPBTRLRO",
                "PriceId": "price_1LqRYrEWoyssAqHu73d7xWEh",
                "Title": "36. BBQ pork & prawn rice noodle soup",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZak5oL5J6BifZ",
                "PriceId": "price_1LqRZDEWoyssAqHu3O6c2q5m",
                "Title": "37. Chicken rice noodle soup",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZalKHpxVmi8J2",
                "PriceId": "price_1LqRZqEWoyssAqHuvhKiVpAg",
                "Title": "38. Seafood rice noodle soup",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZajHw32Y3HifM",
                "PriceId": "price_1LqRXyEWoyssAqHuoGqHeVAs",
                "Title": "39. Shrimp rice noodle soup",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZajO4aazDG2jc",
                "PriceId": "price_1LqRY1EWoyssAqHubWaGLNEI",
                "Title": "40. Egg noodle soup w/ wonton & BBQ pork",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaa9xboY6wdeJ",
                "PriceId": "price_1LqRP0EWoyssAqHu8lgzKPnr",
                "Title": "41. Egg noodle soup w/ wonton & seafood",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZajd458pGfyYm",
                "PriceId": "price_1LqRY3EWoyssAqHuSZiPxh5I",
                "Title": "42. Special Egg noodle & Rice noodle (wonton, bbq pork, & seafood)",
                "Description": null,
                "Price": "$15.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Hu Tieu",
                "ProductOptions": []
            }
        ],
        "StirFried": [
            {
                "ProductId": "prod_MlYjdElfXEHqle",
                "PriceId": "price_1M21bqEWoyssAqHuyraQ9Kbx",
                "Title": "43. Chowmein with vegetables & chicken, beef, or pork",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Stir Fried Noodle",
                "ProductOptions": [
                    {
                        "Title": "Chowmein with vegetables & chicken",
                        "PriceId": "price_1M21bqEWoyssAqHuJq2emz0Q",
                        "Price": "$13.50"
                    },
                    {
                        "Title": "Chowmein with vegetables & beef",
                        "PriceId": "price_1M21bqEWoyssAqHuItbmXsUj",
                        "Price": "$13.50"
                    },
                    {
                        "Title": "Chowmein with vegetables & pork",
                        "PriceId": "price_1M21bqEWoyssAqHu3SM53CI3",
                        "Price": "$13.50"
                    }
                ]
            },
            {
                "ProductId": "prod_MlYj2gv6Obwvn4",
                "PriceId": "price_1M21bqEWoyssAqHuEXWcVFUm",
                "Title": "44. Chowmein with vegetables and shrimp or seafood",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Stir Fried Noodle",
                "ProductOptions": [
                    {
                        "Title": "Chowmein with vegetables & seafood",
                        "PriceId": "price_1M21bqEWoyssAqHuS7ScSBjr",
                        "Price": "$14.50"
                    },
                    {
                        "Title": "Chowmein with vegetables & shrimp",
                        "PriceId": "price_1M21bqEWoyssAqHusA74aooV",
                        "Price": "$14.50"
                    }
                ]
            },
            {
                "ProductId": "prod_MZadcgM42oKxH4",
                "PriceId": "price_1LqRSWEWoyssAqHuaqXKsTYi",
                "Title": "45. Chowfun with vegetables & chicken, beef, or pork",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Stir Fried Noodle",
                "ProductOptions": [
                    {
                        "Title": "Chowfun with vegetables & chicken",
                        "PriceId": "price_1M21bqEWoyssAqHuqX6Vwbwu",
                        "Price": "$13.50"
                    },
                    {
                        "Title": "Chowfun with vegetables & beef",
                        "PriceId": "price_1M21bqEWoyssAqHupjTHkeaU",
                        "Price": "$13.50"
                    },
                    {
                        "Title": "Chowfun with vegetables & pork",
                        "PriceId": "price_1M21bqEWoyssAqHu3F3mTJRV",
                        "Price": "$13.50"
                    }
                ]
            },
            {
                "ProductId": "prod_MZabtvwRM5JcQB",
                "PriceId": "price_1LqRQiEWoyssAqHudxQWfz30",
                "Title": "46. Chowfun with vegetables & shrimp or seafood",
                "Description": null,
                "Price": "$14.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Stir Fried Noodle",
                "ProductOptions": [
                    {
                        "Title": "Chowfun with vegetables & seafood",
                        "PriceId": "price_1M21bqEWoyssAqHupvwfmIpO",
                        "Price": "$14.50"
                    },
                    {
                        "Title": "Chowfun with vegetables & shrimp",
                        "PriceId": "price_1M21bqEWoyssAqHuMgEKb1fL",
                        "Price": "$14.50"
                    }
                ]
            }
        ],
        "RiceDishes": [
            {
                "ProductId": "prod_MZadDdZfjZ2Lq2",
                "PriceId": "price_1LqRRrEWoyssAqHuoYfOGUnL",
                "Title": "47. Rice with beef & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaeX0peKKjsCh",
                "PriceId": "price_1LqRT0EWoyssAqHuMpXwshdv",
                "Title": "48. Rice with pork & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZafIST87Q7wwp",
                "PriceId": "price_1LqRU7EWoyssAqHueSKMUqfq",
                "Title": "49. Rice with chicken & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZabOd7hSX68PF",
                "PriceId": "price_1LqRPqEWoyssAqHuS1i7US5G",
                "Title": "50. Rice with shrimp & vegetables",
                "Description": null,
                "Price": "$13.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaYlmDDZY2dUb",
                "PriceId": "price_1LqRNHEWoyssAqHuiUpQdR4b",
                "Title": "51. Rice with tofu & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaZSMi2Qe7Gy3",
                "PriceId": "price_1LqRO3EWoyssAqHuQtp4SVCI",
                "Title": "52. Rice with seafood & vegetables",
                "Description": null,
                "Price": "$13.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaUGcKr7kyshd",
                "PriceId": "price_1LqRJlEWoyssAqHuIIj96Kme",
                "Title": "53. Rice with curry tofu & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaTIJDSK0oWdi",
                "PriceId": "price_1LqRIXEWoyssAqHuAaMa10Hu",
                "Title": "54. Rice with curry chicken & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaVo4lDCsdIEb",
                "PriceId": "price_1LqRKHEWoyssAqHuQBVbkR0J",
                "Title": "55. Rice with curry beef & vegetables",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaX46UsCdypkf",
                "PriceId": "price_1LqRM4EWoyssAqHuPVoHjfyK",
                "Title": "56. Rice with curry seafood & vegetables",
                "Description": null,
                "Price": "$13.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaQ17btZMjZUz",
                "PriceId": "price_1LqRFIEWoyssAqHu8CzeNiF5",
                "Title": "57. Rice w/ sautéed lemon grass chicken",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaLEaYU6RBbdA",
                "PriceId": "price_1LqRAvEWoyssAqHuxNKzRwKj",
                "Title": "58. Rice with pork chop & egg",
                "Description": null,
                "Price": "$13.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaINrPosan3mU",
                "PriceId": "price_1LqR83EWoyssAqHupCwI4wbU",
                "Title": "59. Rice with eggplant & chicken",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaR5wokAwLqJt",
                "PriceId": "price_1LqRGtEWoyssAqHuibmXBQfi",
                "Title": "60. Rice with eggplant & chicken",
                "Description": null,
                "Price": "$12.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaHXp5VZO0dPJ",
                "PriceId": "price_1LqR7BEWoyssAqHuSvRtyDPh",
                "Title": "61. Saigon Deli rice (short ribs)",
                "Description": null,
                "Price": "$17.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MlYjqkCLGEXZcZ",
                "PriceId": "price_1M21bqEWoyssAqHulvRUSn82",
                "Title": "62. Special rice (choice of chicken, beef, pork or tofu)",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": [
                    {
                        "Title": "Special rice with Chicken",
                        "PriceId": "price_1M21bqEWoyssAqHu5U32dZfU",
                        "Price": "$14.95"
                    },
                    {
                        "Title": "Special rice with Beef",
                        "PriceId": "price_1M21bqEWoyssAqHupoAo64jN",
                        "Price": "$14.95"
                    },
                    {
                        "Title": "Special rice with Tofu",
                        "PriceId": "price_1M21bqEWoyssAqHuPiJ0i59a",
                        "Price": "$14.95"
                    },
                    {
                        "Title": "Special rice with Pork",
                        "PriceId": "price_1M21bqEWoyssAqHurmmIDVkX",
                        "Price": "$14.95"
                    }
                ]
            },
            {
                "ProductId": "prod_MZaH1lo4hgxqG8",
                "PriceId": "price_1LqR70EWoyssAqHu1jeQMdaU",
                "Title": "62. Special rice with beef",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MlYjF4RA1ajAgH",
                "PriceId": "price_1M21bqEWoyssAqHuL8INXatW",
                "Title": "63. Spicy Beef Noodle Soup (Vermicelli noodle, sliced beef, special meatball, lemongrass)",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Rice Dishes",
                "ProductOptions": []
            }
        ],
        "FriedRice": [
            {
                "ProductId": "prod_MZaGpy7zrqgwdH",
                "PriceId": "price_1LqR5hEWoyssAqHu7fcxhgNt",
                "Title": "64. Fried rice with chicken or BBQ pork",
                "Description": null,
                "Price": "$12.75",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Fried Rice",
                "ProductOptions": [
                    {
                        "Title": "Fried rice with BBQ Pork",
                        "PriceId": "price_1M21bqEWoyssAqHuVMfvcruT",
                        "Price": "$12.75"
                    },
                    {
                        "Title": "Fried rice with Chicken",
                        "PriceId": "price_1M21bqEWoyssAqHuk68JUmDq",
                        "Price": "$12.75"
                    }
                ]
            },
            {
                "ProductId": "prod_MZa1M6FydXBEyw",
                "PriceId": "price_1LqQrjEWoyssAqHu8P1g8bPR",
                "Title": "65. Fried rice with shrimp",
                "Description": null,
                "Price": "$13.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Fried Rice",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZa6i0k4YKomwv",
                "PriceId": "price_1LqQw0EWoyssAqHuGujO8PbG",
                "Title": "66. Fried rice with BBQ pork & shrimp",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Fried Rice",
                "ProductOptions": []
            }
        ],
        "SourSoup": [
            {
                "ProductId": "prod_MZa2IP1Yl2wXOG",
                "PriceId": "price_1LqQsmEWoyssAqHu3ryPR5lH",
                "Title": "67. Sour soup w/ catfish",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Sour Soup",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZa7IEPnPXx4B2",
                "PriceId": "price_1LqQxDEWoyssAqHuuFdH7VDm",
                "Title": "68. Sour soup w/ chicken",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Sour Soup",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZa5jIzRRb1tGb",
                "PriceId": "price_1LqQurEWoyssAqHurqa25aTl",
                "Title": "69. Sour soup w/ beef",
                "Description": null,
                "Price": "$13.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Sour Soup",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZa3HCHg78ykdM",
                "PriceId": "price_1LqQtJEWoyssAqHuatgoIZtE",
                "Title": "70. Sour soup w/ shrimp",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Sour Soup",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZa1XnXZm7fcP9",
                "PriceId": "price_1LqQr5EWoyssAqHug9TtBmos",
                "Title": "71. Sour soup w/ seafood",
                "Description": null,
                "Price": "$14.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Sour Soup",
                "ProductOptions": []
            }
        ],
        "Beverage": [
            {
                "ProductId": "prod_MZaCJ09T2jCIIv",
                "PriceId": "price_1LqR23EWoyssAqHug5ouEJGu",
                "Title": "72. Canned soda",
                "Description": null,
                "Price": "$1.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZZv6YjiHixb7w",
                "PriceId": "price_1LqQlQEWoyssAqHuF74Ih2lC",
                "Title": "73. Snapple",
                "Description": null,
                "Price": "$2.75",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZZzVUVk9Lr5fT",
                "PriceId": "price_1LqQpNEWoyssAqHuyHP3knBo",
                "Title": "74. Soybean milk",
                "Description": null,
                "Price": "$2.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZZycmtCv1JHSR",
                "PriceId": "price_1LqQoQEWoyssAqHu1IYYqJq9",
                "Title": "75. Fresh lemonade",
                "Description": null,
                "Price": "$4.95",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZaBqFQ0p9nVVp",
                "PriceId": "price_1LqR0tEWoyssAqHuVqg0AXo9",
                "Title": "76. Coconut juice",
                "Description": null,
                "Price": "$4.25",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": []
            },
            {
                "ProductId": "prod_MZZwjXt3nclSNk",
                "PriceId": "price_1LqQmqEWoyssAqHuH57aJ7KE",
                "Title": "77. Vietnamese coffee (served warm or cold with condensed milk)",
                "Description": null,
                "Price": "$5.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": [
                    {
                        "Title": "Vietnamese Coffee (cold)",
                        "PriceId": "price_1M21bqEWoyssAqHuVt0nyeRS",
                        "Price": "$5.50"
                    },
                    {
                        "Title": "Vietnamese Coffee (warm)",
                        "PriceId": "price_1M21bqEWoyssAqHumcP4s1qa",
                        "Price": "$5.50"
                    }
                ]
            },
            {
                "ProductId": "prod_MZZyw4Ql0ETBl5",
                "PriceId": "price_1LqQomEWoyssAqHu7wsK9JnQ",
                "Title": "78. Thai iced tea",
                "Description": null,
                "Price": "$4.50",
                "SmallPrice": null,
                "LargePrice": null,
                "SmallPriceId": null,
                "LargePriceId": null,
                "Category": "Beverage",
                "ProductOptions": []
            }
        ],
        "Restaurant": {
            "Weekdays": "11am-8pm",
            "Weekends": "11:30am-8pm",
            "Phone": "(206) 634-2866",
            "Notice": "",
            "Catering": "Don't forget to ask us about our catering service for your event or party."
        }
    })
      // body: JSON.stringify({ 
      //   Appetizers: appetizers, 
      //   Pho: pho, 
      //   Bun: bun, 
      //   Vegetarian: vegetarian, 
      //   BanhCanh: banhcanh, 
      //   HuTieu: hutieu, 
      //   StirFried: stirfried, 
      //   RiceDishes: ricedishes, 
      //   FriedRice: friedrice, 
      //   SourSoup: soursoup, 
      //   Beverage: beverage, 
      //   Restaurant: {
      //     Weekdays: "11am-8pm",
      //     Weekends: "11:30am-8pm",
      //     Phone: "(206) 634-2866",
      //     Notice: "",
      //     Catering: "Don't forget to ask us about our catering service for your event or party."
      //   }
      // })
    };
};

export { handler };