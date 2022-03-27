module.exports = {
  siteMetadata: {
    siteUrl: "https://www.saigondeliuw.com",
    title: "Saigon Deli",
    description: "The best and most affordable Vietnamese food in Seattle. We serve delicious banh mi, pho, and other rice dishes."
  },
  plugins: [`gatsby-plugin-react-helmet`, {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [
          "G-HC6Z1GCZRY", // Google Analytics / GA
        ],
      },
    },
  ],
};
