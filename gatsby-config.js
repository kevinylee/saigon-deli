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
        /*
        // This object gets passed directly to the gtag config command
        // This config will be shared across all trackingIds
        gtagConfig: {
          optimize_id: "OPT_CONTAINER_ID",
          anonymize_ip: true,
          cookie_expires: 0,
        },
        // This object is used for configuration specific to this plugin
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: false,
          // Setting this parameter is also optional
          respectDNT: true,
          // Avoids sending pageview hits from custom paths
          exclude: ["/preview/**", "/do-not-track/me/too/"],
          // Defaults to https://www.googletagmanager.com
          origin: "YOUR_SELF_HOSTED_ORIGIN",
        },
        */
      },
    },
  ],
};
