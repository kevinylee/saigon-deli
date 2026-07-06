import { SupabaseClient } from '@supabase/supabase-js';
import { supabase, stripe } from '../lib/clients';
import Stripe from 'stripe';
import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions';

export interface AppDeps {
  supabase: SupabaseClient
  stripe: Stripe
  event: HandlerEvent
  context: HandlerContext
}

type AppFunc = (deps: AppDeps) => Promise<HandlerResponse>

const AppHandler = (func: AppFunc): Handler => async (event, context) => {
  try {
    return await func({ supabase, stripe, event, context })
  } catch (err) {
    console.error(err)

    return {
      statusCode: 500,
      body: JSON.stringify({error: "Internal Server Error"})
    }
  }
}

export default AppHandler;