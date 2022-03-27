import { Handler } from "@netlify/functions";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

const handler: Handler = async (event, context) => {
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet('1GneLscLi_f5Xc4moIaIQm5DdDALuP1JtFqOtUhy9yAo');

  const formattedKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, "\n")

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: formattedKey,
  });
  
  const res = await doc.loadInfo().then(async () => {
    console.log(doc.title);

    const menuSheet: GoogleSpreadsheetWorksheet =  doc.sheetsByIndex[0];
    const menuRows = await menuSheet.getRows() as any;
    const finalrows = menuRows.map(row => {
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

    const restaurantSheet: GoogleSpreadsheetWorksheet =  doc.sheetsByIndex[1];
    const restaurantRow = await restaurantSheet.getRows();
    const formatted = restaurantRow.map((row) => {
      return ({
        "Weekdays": row['Weekdays'],
        "Weekends": row['Weekends'],
        "Phone Number": row['Phone Number'],
        "Special Notice": row['Special Notice']
      });
    });

    console.log(formatted);
  
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        Appetizers: appetizers, 
        Pho: pho, 
        Bun: bun, 
        Vegetarian: vegetarian, 
        BanhCanh: banhcanh, 
        HuTieu: hutieu, 
        StirFried: stirfried, 
        RiceDishes: ricedishes, 
        FriedRice: friedrice, 
        SourSoup: soursoup, 
        Beverage: beverage, 
        Restaurant: {
          Weekdays: formatted[0].Weekdays,
          Weekends: formatted[0].Weekends,
          Phone: formatted[0]['Phone Number'],
          Notice: formatted[0]['Special Notice']
        } 
      })
    };
  }).catch(err => {
    console.log(err);
  });
  
  return res || {
    statusCode: 500,
    body: JSON.stringify({ Menu: [], Appetizers: [], Pho: [], Bun: [], Vegetarian: [], BanhCanh: [], HuTieu: [], StirFried: [], RiceDishes: [], FriedRice: [], SourSoup: [], Beverage: [], 
      Restaurant: {
        Weekdays: '',
        Weekends: '',
        Phone: '',
        Notice: ''
      } 
    }),
  };
};

export { handler };