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

To debug locally, you can run the node REPL with: `node --env-file=.env.development`

## Deploying to Production

All hooked up via Netlify.

## Sales Tax

This app collects Washington combined sales tax (10.55%) on food only.
Tips are not taxed. The rate is implemented as a Stripe `TaxRate`
attached to each food line item at checkout time.

Two env vars must be kept in sync:

| Variable | Scope | Example |
|---|---|---|
| `GATSBY_TAX_RATE_PERCENT` | Client (Gatsby-bundled) | `10.55` |
| `STRIPE_TAX_RATE_ID` | Server (Netlify functions) | `txr_…` |

**If the WA sales tax rate changes:**

1. Create a new `TaxRate` in the Stripe Dashboard (do not edit the existing one — Stripe TaxRates are immutable for already-issued invoices).
2. Update `STRIPE_TAX_RATE_ID` in Netlify env to the new `txr_…`.
3. Update `GATSBY_TAX_RATE_PERCENT` in Netlify env to match the new percentage.
4. Redeploy.

Both env vars must match the Stripe Dashboard rate — otherwise the in-app preview will disagree with the Stripe Checkout page.

## Todo

- [x] Show variant option in the add item modal
- [x] Valid client checkout payload with server products
- [x] By default, have a variant selected in the Add Item modal
- [x] Show the total price via the size option. On the backend we calculate variant base price + size add price for the total and we show that.
- [x] Show lowest variant price on menu item selection
- [x] Fix the dashboard time zone conversions by storing TZ in the database
- [x] Add Sentry
- [x] End-to-end flow testing
- [x] Figure out spicy lemongrass add on price issue
- [x] Run the script. Get everything in the DB.
- [x] Add all ItemSizes (missing all the OS)
- [x] Update gsheets to load from DB
- [x] Go through checkout flow, fix bugs
- [x] Update checkout to fetch data through DB
- [x] Grab the add-on price and size price according to the item, rather than centralized AddOn and Size objects
- [x] Add Rice dishes section
- [x] Add Beverages
- [x] Copy all the tables & rows to production

- [ ] Sort by uncompleted orders or sort by delivery dates
- [ ] Allow you to edit availability in the dashboard
- [ ] Non-online form version of the menu for price changes

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
