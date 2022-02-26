import { Handler } from "@netlify/functions";
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler: Handler = async (event, context) => {
  console.log('we made it');
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet('1GneLscLi_f5Xc4moIaIQm5DdDALuP1JtFqOtUhy9yAo');
  console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log(process.env.GOOGLE_PRIVATE_KEY);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });
  

  const res = await doc.loadInfo().then(async () => {
    console.log(doc.title);

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const finalrows = rows.map(row => {
      return ({
        "Category": row.Category,
        "Title": row.Title,
        "Price": row.Price,
        "Description": row.Description,
      });
    });
  
    console.log(finalrows);
  
    return {
      statusCode: 200,
      body: JSON.stringify({ Rows: finalrows }),
    };
  }).catch(err => {
    console.log('awawdwaadwda');
    console.log(err);
  });

  if (res) {
    return res;
  }kevy
  

  return {
    statusCode: 500,
    body: JSON.stringify({ Rows: [] }),
  };
};

export { handler };