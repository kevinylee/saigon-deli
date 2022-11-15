const axios = require('axios');

exports.createPages = async ({ actions: { createPage } }) => {
  // https://saigon-deli.netlify.app
  const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");

  const response = await axios.get(`${BASE_URL}/.netlify/functions/gsheets`).catch(error => {
    console.log(error);
  });

  const appetizers = formatResponse(response.data.Appetizers);
  const pho = formatResponse(response.data.Pho);
  const bun = formatResponse(response.data.Bun);
  const vegetarian = formatResponse(response.data.Vegetarian);
  const banhcanh = formatResponse(response.data.BanhCanh);
  const hutieu = formatResponse(response.data.HuTieu);
  const stirfried = formatResponse(response.data.StirFried);
  const ricedishes = formatResponse(response.data.RiceDishes);
  const friedrice = formatResponse(response.data.FriedRice);
  const soursoup = formatResponse(response.data.SourSoup);
  const beverage = formatResponse(response.data.Beverage);
  let restaurant = formatResponse(response.data.Restaurant);

  if (restaurant === null) {
    restaurant = {
      Phone: '',
      Weekdays: '',
      Weekends: '',
      Notice: '',
      Catering: ''
    }
  }

  // Create the index page & fill it with menu data
  createPage({
    path: `/`,
    component: require.resolve("./src/templates/index.js"), 
    context: { 
      appetizers, pho, bun, vegetarian, banhcanh, hutieu, stirfried, ricedishes, friedrice, soursoup, beverage,
      restaurant
    },
  });
};

const formatResponse = (r) => r;