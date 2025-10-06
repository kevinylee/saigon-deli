<h1 align="center">
  Saigon Deli
</h1>

## Prerequisites

Make sure you have Homebrew, Stripe CLI, and Gatsby CLI installed:
- https://brew.sh/
- https://docs.stripe.com/stripe-cli

1. Run `npm install`
2. Create your own `.env.development` file in the project root
3. Copy over the specific environment variables you would like to load.

## 🚀 Running Locally

(Make sure you're running a _nice_ Node version ie. 14.15.0+ or the `lts` version from `nvm`)

1. Run the Netlify functions separately: `npx netlify functions:serve`
2. Run the website: `npx gatsby develop`
3. Run the webhooks: `stripe listen --forward-to http://localhost:9999/.netlify/functions/webhook`

## Deploying to Production

All hooked up via Netlify.

## Todo

- [x] Show variant option in the add item modal
- [x] Valid client checkout payload with server products
- [x] By default, have a variant selected in the Add Item modal
- [x] Show the total price via the size option. On the backend we calculate variant base price + size add price for the total and we show that.
- [ ] Show lowest variant price on menu item selection
- [ ] TEST OUT STRIPE FLOW. SEE IF IT WORKS
- [ ] Migrate to JSON file for menu items!!!

- [ ] Grab the add-on price and size price according to the item
- [ ] Sort by uncompleted orders or sort by delivery dates
- [ ] Allow you to edit availability in the dashboard
- [ ] Non-online form version of the menu
- [ ] Show "2 hours from now ..." text in the dashboard

- [x] Add "View Cart" before going to checkout
- [x] Support tips in the view cart modal
- [x] Support Pick up at time in the checkout modal
- [x] Remove line item from cart functionality
- [x] Show add ons properly in the receipt page
- [x] Show pickup time in the receipt page
- [x] Update dashboard to show add ons
- [x] Update dashboard to show pickup time

- [x] Handle small & large variant items in order modal
- [x] Handle add ons in order modal
- [x] Use inline prices on checkout session creation
- [x] Deprecate use of Stripe Products and use inline prices
- [x] Add per-item availability in the website
- [x] Remove dependency on Supabase in Gatsby


## Development Notes

When testing out branch deployments, make sure your `BASE_URL` is set correctly. In other words, you might have to use the preview deployment link rather than our production url in your code. Once you merge into `main`, then you can switch out the preview deployment link for the production url. This is because the production url does not have your latest code, until you merge into `main`.

## Product Notes

A menu item has many variants, add-ons, and size options. Each menu item will have at least one variant.
A variant is a menu item with a specific set of ingredients. An add-on can be applied with other add-ons onto a variant.
A variant is a line item on the receipt. You cannot merge two variants as a single line item.

On the menu, you will see items first. Clicking into an item means you're now selecting for a specific variant.
You can then pick a variant, any add-ons for the variant, the size, and the quantity for this purchaseable group.

Technical Decisions:
- Availability is on the variant level, not item or per-size level
- Variants of one size will have the field `null`
- Items with a single variant will define their own title, even if it's the same as the item title.
- Add-on prices are not per-item customizable
- Sizes add on to the base price, they are not a replacement for it
- You can have one item, many variants or the other way: many items, each with one variant depending on the UX priority.
- Size prices are per variant
