import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js"

const headers = {
  'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST'
}

if (!process.env.GATSBY_SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials founded.";
}

const supabase = createClient(
  process.env.GATSBY_SUPABASE_API_URL,
  process.env.SUPABASE_PRIVATE_KEY
)

const handler: Handler = async (event, context) => {
  // handle OPTIONS requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers
    }
  }

  // check against inability to parse out `password`
  const payload = JSON.parse(event.body as any);

  if (payload.type == 'TOGGLE_OPEN') {
    // Expect `data` to be a boolean
    const { data, error } = await supabase.from('Schedules').update({
      reason: payload.open
    }).eq('id', -1);

    console.log(data);

    if (error) { 
      console.log(error);
    }

  } else if (payload.type == 'DATE_RANGE') {
    // Expect `data` to be { start_datetime: "", end_datetime: "", reason: "" }
    const { data, error } = await supabase.from('Schedules').insert({
      start_datetime: payload.start_datetime,
      end_datetime: payload.end_datetime,
      reason: payload.reason
    });

    if (error) { 
      console.log(error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: true }),
    headers
  };
};

export { handler };