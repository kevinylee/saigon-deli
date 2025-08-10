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

Next: see cart and remove from cart functionality
Remember: Pick up at time should also be set here too
Sticky header with: tip, checkout button, total price and total items, AND view cart
Sticky header with: tip, view cart or "checkout". Modal then shows items and checkout button 

- [x] Add "View Cart" before going to checkout

- [x] Support tips in the view cart modal
- [x] Support Pick up at time in the checkout modal
- [x] Remove line item from cart functionality
- [x] Show add ons properly in the receipt page
- [x] Show pickup time in the receipt page
- [ ] Sort by uncompleted orders or sort by delivery dates
- [ ] Update dashboard to show add ons
- [ ] Update dashbaord to show pickup time
- [ ] Migrate to JSON file for menu items

- [x] Handle small & large variant items in order modal
- [x] Handle add ons in order modal
- [x] Use inline prices on checkout session creation
- [x] Deprecate use of Stripe Products and use inline prices
- [x] Add per-item availability in the website
- [ ] Allow you to edit availability in the dashboard
- [ ] Non-online form version of the menu
- [x] Remove dependency on Supabase in Gatsby

## Development Notes

When testing out branch deployments, make sure your `BASE_URL` is set correctly. In other words, you might have to use the preview deployment link rather than our production url in your code. Once you merge into `main`, then you can switch out the preview deployment link for the production url. This is because the production url does not have your latest code, until you merge into `main`.

## Product Notes

A menu item has many variants and add-ons. Each menu item will have at least one variant.
An add-on can be applied with other add-ons onto a variant. A variant is a line item on the orderbook. 
You cannot merge two variants as a single line item.

Technical Decisions:
- Availability is on the variant level, not item or per-size level
- Variants of one size will have the field `null`
- Items with a single variant will inherit the item title
- Add-on prices are not per-item customizable
- Sizes add on to the base price, they are not a replacement for it
- You can have one item, many variants or the other way: many items, each with one variant depending on the UX priority.
- Size prices are per variant
