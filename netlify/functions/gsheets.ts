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
};

export { handler };