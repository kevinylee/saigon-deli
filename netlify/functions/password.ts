import { Handler } from "@netlify/functions";

const headers = {
  'Access-Control-Allow-Origin': '*', // unsafe to allow any origin; fix this
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST'
}

const handler: Handler = async (event, context) => {
  // handle OPTIONS requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers
    }
  }

  // check against inability to parse out `password`
  const { password } = JSON.parse(event.body);

  if (password === process.env.NETLIFY_PASSWORD) {
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true }),
      headers
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: false }),
    headers
  };
};

export { handler };