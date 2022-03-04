import { Handler } from "@netlify/functions";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

const handler: Handler = async (event, context) => {
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet('1GneLscLi_f5Xc4moIaIQm5DdDALuP1JtFqOtUhy9yAo');

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });
  
  const res = await doc.loadInfo().then(async () => {
    console.log(doc.title);

    const sheet: GoogleSpreadsheetWorksheet =  doc.sheetsByIndex[0];
    const rows = await sheet.getRows() as any;
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
      body: JSON.stringify({ Menu: finalrows, Hours: [] }),
    };
  }).catch(err => {
    console.log(err);
  });
  
  return res || {
    statusCode: 500,
    body: JSON.stringify({ Menu: [], Hours: [] }),
  };
};

export { handler };