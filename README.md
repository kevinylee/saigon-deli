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

- [ ] Migrate to JSON file for menu items
- [ ] Deprecate use of Stripe Products and use inline prices
- [ ] Add "Order later" time
- [ ] Add per-item availability and updates in the dashboard

## Notes

When testing out branch deployments, make sure your `BASE_URL` is set correctly. In other words, you might have to use the preview deployment link rather than our production url in your code. Once you merge into `main`, then you can switch out the preview deployment link for the production url. This is because the production url does not have your latest code, until you merge into `main`.
