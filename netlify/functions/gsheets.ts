import { Handler } from "@netlify/functions";
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler: Handler = async (event, context) => {
  console.log('we made it');
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet('1GneLscLi_f5Xc4moIaIQm5DdDALuP1JtFqOtUhy9yAo');

  doc.useApiKey("...");

  await doc.loadInfo().catch(err => {
    console.log(err);
  });
  console.log(doc.title);

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: false }),
  };
};

export { handler };