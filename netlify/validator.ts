if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
    throw "No Supabase credentials found.";
}

if (!process.env.STRIPE_SECRET ||
    !process.env.STRIPE_TAX_RATE_ID) {
    throw "No Stripe credentials found.";
}