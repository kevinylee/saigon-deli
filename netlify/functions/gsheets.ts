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
        "LargePrice": row.LargePrice,
        "SmallPrice": row.SmallPrice,
      });
    });
    
    // hard coded. new categories will not be accounted for.
    const appetizers = finalrows.filter(item => item.Category === "Appetizers");
    const pho = finalrows.filter(item => item.Category === "Pho");
    const bun = finalrows.filter(item => item.Category === "Bun");
    const vegetarian = finalrows.filter(item => item.Category === "Vegetarian");
    const banhcanh = finalrows.filter(item => item.Category === "Banh Canh");
    const hutieu = finalrows.filter(item => item.Category === "Hu Tieu");
    const stirfried = finalrows.filter(item => item.Category === "Stir Fried Noodle");
    const ricedishes = finalrows.filter(item => item.Category === "Rice Dishes");
    const friedrice = finalrows.filter(item => item.Category === "Fried Rice");
    const soursoup = finalrows.filter(item => item.Category === "Sour Soup");
    const beverage = finalrows.filter(item => item.Category === "Beverage");

    // console.log(appetizers);
  
    return {
      statusCode: 200,
      body: JSON.stringify({ Menu: finalrows, Appetizers: appetizers, Pho: pho, Bun: bun, Vegetarian: vegetarian, BanhCanh: banhcanh, HuTieu: hutieu, StirFried: stirfried, RiceDishes: ricedishes, FriedRice: friedrice, SourSoup: soursoup, Beverage: beverage, Hours: [] }),
    };
  }).catch(err => {
    console.log(err);
  });
  
  return res || {
    statusCode: 500,
    body: JSON.stringify({ Menu: [], Appetizers: [], Pho: [], Bun: [], Vegetarian: [], BanhCanh: [], HuTieu: [], StirFried: [], RiceDishes: [], FriedRice: [], SourSoup: [], Beverage: [], Hours: [] }),
  };
};

export { handler };