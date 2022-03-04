const axios = require('axios');

exports.createPages = async ({ actions: { createPage } }) => {
  const response = await axios.get('http://localhost:9999/.netlify/functions/gsheets').catch(error => {
    console.log(error);
  });

  const menu = formatResponse(response.data.Rows);

  // Create the index page & fill it with menu data
  createPage({
    path: `/`,
    component: require.resolve("./src/templates/index.js"),
    context: { 
      menu,
    },
  })
};

const formatResponse = (r) => r;