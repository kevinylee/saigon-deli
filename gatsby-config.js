require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteUrl: "https://www.saigondeliuw.com",
    title: "Saigon Deli",
    description: "Serving delicious Vietnamese food in the University District. We serve banh mi, pho, bun bo hue, and other specialiy dishes all made in-house with love."
  },
  plugins: [`gatsby-plugin-sass`, `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [
          "G-HC6Z1GCZRY", // Google Analytics / GA
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images/`,
      },
    },
  ],
};
