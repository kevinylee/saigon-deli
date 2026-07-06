import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe';

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY)
  throw new Error("No Supabase credentials founded.");

if (!process.env.STRIPE_SECRET)
  throw new Error("No Stripe credentials found.");

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_PRIVATE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: "2022-08-01"
});

export { supabase, stripe };


