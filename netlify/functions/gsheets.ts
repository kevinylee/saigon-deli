import { Handler } from "@netlify/functions";
import Stripe from 'stripe';
import { createClient } from "@supabase/supabase-js"
import { DateTime } from 'luxon'
import jsonMenu from '../../catalog/main.json';


const DOMAIN = process.env.BASE_URL;

if (!process.env.STRIPE_SECRET || !DOMAIN) {
  throw "No Stripe API key or base URL founded.";
}

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials founded.";
}

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_PRIVATE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: "2022-08-01"
});

const handler: Handler = async (event, context) => {
  const { data, error } = await supabase.from('Schedules').select().or(`start_datetime.gte.${DateTime.now()},id.eq.-1`)

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ...error })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...jsonMenu.sections,
      business_details: {
        Weekdays: "11am-8pm",
        Weekends: "11:30am-8pm",
        Phone: "(206) 634-2866",
        Notice: "",
        Catering: "Don't forget to ask us about our catering service for your event or party.",
        Schedules: data
      }
    })
  }

  // const appetizers = merged.filter(item => item.Category === "Appetizers");
  // const pho = merged.filter(item => item.Category === "Pho");
  // const bun = merged.filter(item => item.Category === "Bun");
  // const vegetarian = merged.filter(item => item.Category === "Vegetarian");
  // const banhcanh = merged.filter(item => item.Category === "Banh Canh");
  // const hutieu = merged.filter(item => item.Category === "Hu Tieu");
  // const stirfried = merged.filter(item => item.Category === "Stir Fried Noodle");
  // const ricedishes = merged.filter(item => item.Category === "Rice Dishes");
  // const friedrice = merged.filter(item => item.Category === "Fried Rice");
  // const soursoup = merged.filter(item => item.Category === "Sour Soup");
  // const beverage = merged.filter(item => item.Category === "Beverage");
  // const tips = merged.filter(item => item.Category === "Tips");

  // // Fetch only schedules that are in the future
  // // const { data, error } = await supabase.from('Schedules').select().gte('start_datetime', DateTime.now());
  // const { data, error } = await supabase.from('Schedules').select().or(`start_datetime.gte.${DateTime.now()},id.eq.-1`)

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ 
  //     Appetizers: appetizers, 
  //     Pho: pho, 
  //     Bun: bun, 
  //     Vegetarian: vegetarian, 
  //     BanhCanh: banhcanh, 
  //     HuTieu: hutieu, 
  //     StirFried: stirfried,
  //     RiceDishes: ricedishes, 
  //     FriedRice: friedrice, 
  //     SourSoup: soursoup, 
  //     Beverage: beverage, 
  //     Tips: tips,
  //     Restaurant: {
  //       Weekdays: "11am-8pm",
  //       Weekends: "11:30am-8pm",
  //       Phone: "(206) 634-2866",
  //       Notice: "",
  //       Catering: "Don't forget to ask us about our catering service for your event or party.",
  //       Schedules: data
  //     }
  //   })
  // };
};

export { handler };