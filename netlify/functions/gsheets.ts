import { Handler } from "@netlify/functions";
import { handler as menuApi } from "./menu";

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials founded.";
}

const handler: Handler = async (event, context) => {
  return menuApi(event, context);
};

export { handler };
