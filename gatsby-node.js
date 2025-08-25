const axios = require('axios');

exports.createPages = async ({ actions: { createPage } }) => {
  const BASE_URL = (process.env.GATSBY_ENV === "prod" ? "https://saigon-deli.netlify.app" : "http://localhost:9999");

  const response = await axios.get(`${BASE_URL}/.netlify/functions/gsheets`).catch(error => {
    console.log(error);
  });

  const { appetizers, pho, business_details } = response.data;

  // const appetizers = response.data.Appetizers;
  // const pho = response.data.Pho;
  // const bun = response.data?.Bun;
  // const vegetarian = response.data?.Vegetarian;
  // const banhcanh = response.data?.BanhCanh;
  // const hutieu = response.data?.HuTieu;
  // const stirfried = response.data?.StirFried;
  // const ricedishes = response.data?.RiceDishes;
  // const friedrice = response.data?.FriedRice;
  // const soursoup = response.data?.SourSoup;
  // const beverage = response.data?.Beverage;
  // let restaurant = response.data?.Restaurant;
  // let tips = response.data?.Tips;

  if (business_details === null) {
    business_details = {
      Phone: '',
      Weekdays: '',
      Weekends: '',
      Notice: '',
      Catering: '',
      Schedules: []
    }
  }

  const isOpen = business_details.Schedules.some((sched) => sched.id == -1 && sched.reason == 'true');

  console.log(business_details);

  // Create the index page & fill it with menu data
  createPage({
    path: `/`,
    component: require.resolve("./src/templates/index.jsx"),
    context: {
      appetizers,
      pho,
      bun: null,
      vegetarian: null,
      banhcanh: null,
      hutieu: null,
      stirfried: null,
      ricedishes: null,
      friedrice: null,
      soursoup: null,
      beverage: null,
      business_details,
      tips: null,
      open: isOpen
    },
  });

  createPage({
    path: `/dashboard`,
    component: require.resolve("./src/templates/dashboard.jsx"),
    context: {
      business_details,
      open: true
    },
  });
};