import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {

  const { password } = JSON.parse(event.body);

  if (password === process.env.NETLIFY_PASSWORD) {
    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ valid: false }),
  };
};

export { handler };