import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials founded.";
}

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_PRIVATE_KEY
)

const headers = {
  'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET'
}

const handler: Handler = async (event, _) => {
  if (event.httpMethod === 'POST') {

    if (!event.body) {
      console.log(event)  
      throw "No request body attached.";
    }

    const { id } = JSON.parse(event.body);

    const { data, error } = await supabase.from('Orders').update({
      acknowledged: true
    }).eq('id', id)

    if (error) {
      console.log(error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: headers
    }
  }

  const { data, error } = await supabase.from('Orders').select('*').order('created_at', { ascending: false })

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Invalid DB response. ${error}`
      }),
      headers: headers
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: headers
  }
}

export { handler };