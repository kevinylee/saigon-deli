<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Saigon Deli Website
</h1>

## 🚀 Running Locally

(Make sure you're running a _nice_ Node version ie. 14.15.0+ or the `lts` version from `nvm`)

1. Run the Netlify functions separately: `netlify functions:serve`
2. Run the website: `gatsby develop`
3. Run the webhooks: `stripe listen --forward-to http://localhost:9999/.netlify/functions/webhook`

## Deploying to Production

All hooked up via Netlify.

## Todo
- [ ] Integrate `gatsby-image`
- [ ] Fix mobile view
- [ ] Refactor code structure

## Notes

When testing out branch deployments, make sure your `BASE_URL` is set correctly. In other words, you might have to use the preview deployment link rather than our production url in your code. Once you merge into `main`, then you can switch out the preview deployment link for the production url. This is because the production url does not have your latest code, until you merge into `main`.