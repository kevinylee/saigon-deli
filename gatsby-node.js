const axios = require('axios');

exports.createPages = async ({ actions: { createPage } }) => {
  const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");

  const response = await axios.get(`${BASE_URL}/.netlify/functions/gsheets`).catch(error => {
    console.log(error);
  });

  const { sectionKeys, tipVariant, businessDetails } = response.data;

  const isOpen = business_details.Schedules.some((sched) => sched.id == -1 && sched.reason == 'true');

  // Create the index page & fill it with menu data
  createPage({
    path: `/`,
    component: require.resolve("./src/templates/index.jsx"),
    context: {
      tipVariant,
      sectionKeys,
      businessDetails,
      open: isOpen
    },
  });

  createPage({
    path: `/dashboard`,
    component: require.resolve("./src/templates/dashboard.jsx"),
    context: {
      businessDetails,
      open: isOpen
    },
  });
};