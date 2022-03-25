const axios = require('axios');

exports.createPages = async ({ actions: { createPage } }) => {
  // const response = await axios.get('https://saigon-deli.netlify.app/.netlify/functions/gsheets').catch(error => {
  //   console.log(error);
  // });

  // const menu = formatResponse(response.data.Menu); // ARRAY of json objects
  // const appetizers = formatResponse(response.data.Appetizers);
  // const pho = formatResponse(response.data.Pho);
  // const bun = formatResponse(response.data.Bun);
  // const vegetarian = formatResponse(response.data.Vegetarian);
  // const banhcanh = formatResponse(response.data.BanhCanh);
  // const hutieu = formatResponse(response.data.HuTieu);
  // const stirfried = formatResponse(response.data.StirFried);
  // const ricedishes = formatResponse(response.data.RiceDishes);
  // const friedrice = formatResponse(response.data.FriedRice);
  // const soursoup = formatResponse(response.data.SourSoup);
  // const beverage = formatResponse(response.data.Beverage);

  // // Create the index page & fill it with menu data
  // createPage({
  //   path: `/`,
  //   component: require.resolve("./src/templates/index.js"), 
  //   context: { 
  //     menu, appetizers, pho, bun, vegetarian, banhcanh, hutieu, stirfried, ricedishes, friedrice, soursoup, beverage,
  //   },
  // });
};

const formatResponse = (r) => r;