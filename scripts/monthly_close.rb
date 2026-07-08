# frozen_string_literal: true

# Usage: ruby scripts/monthly_close.rb 2026-06-01 2026-06-30

require 'stripe'
require 'date'
require 'time'

# Inline your Stripe SECRET key here (starts with sk_test_... or sk_live_...).
STRIPE_API_KEY = 'redacted'

# WA DOR combined sales-tax rate for restaurants.
DOR_TAX_RATE = 0.1055

# Store timezone. Stripe timestamps are UTC; we treat the CLI dates as local
# days in this zone. '-07:00' = Pacific Daylight (summer). Use '-08:00' in winter.
TIME_ZONE = '-07:00'

# Line item title used for tips (see netlify/functions/checkout.ts — tips are
# added as a product literally named "Tip").
TIP_TITLE = 'Tip'

def parse_args
  args = ARGV.dup

  if args.length != 2
    warn 'Usage: ruby scripts/monthly_close.rb <START_DATE> <END_DATE>'
    warn 'Example: ruby scripts/monthly_close.rb 2026-06-01 2026-06-30'
    exit 1
  end

  start_date = Date.parse(args[0])
  end_date   = Date.parse(args[1])

  # Convert inclusive local-day range to unix timestamps for Stripe.
  gte = Time.parse("#{start_date}T00:00:00#{TIME_ZONE}").to_i
  # End of the end_date's day: start of the NEXT day, minus 1 second.
  lte = Time.parse("#{end_date + 1}T00:00:00#{TIME_ZONE}").to_i - 1

  [start_date, end_date, gte, lte]
end

def dollars(cents)
  format('$%.2f', cents / 100.0)
end

# Sum the pre-tax, pre-tip subtotal of a checkout session's food line items,
# and the tax Stripe actually charged on that food. Returns [subtotal, tax].
def checkout_session_breakdown(session_id)
  food_subtotal = 0
  sales_tax     = 0
  Stripe::Checkout::Session.list_line_items(session_id, limit: 100).auto_paging_each do |li|
    next if li.description == TIP_TITLE

    food_subtotal += li.amount_subtotal.to_i

    # Before May 2026, this is always 0.
    # Not actually used in the script.
    sales_tax     += li.amount_tax.to_i
  end
  [food_subtotal, sales_tax]
end

# Sales figures for sessions CREATED in the period. Returns:
#   [gross_pretax_cents, gross_revenue_cents, fees_cents, paid_count, skipped_count]
#   - gross_pretax:  pre-tax, pre-tip food subtotal
#   - gross_revenue: total charged (food + tax + tip)
#   - fees:          Stripe processing fees (what Stripe keeps)
def gross_sales(gte, lte)
  gross_pretax  = 0
  gross_revenue = 0
  fees          = 0
  paid = 0
  skipped = 0

  Stripe::Checkout::Session.list(
    created: { gte: gte, lte: lte },
    status: 'complete',
    limit: 100,
    expand: ['data.payment_intent.latest_charge.balance_transaction']
  ).auto_paging_each do |session|
    unless session.payment_status == 'paid'
      skipped += 1
      next
    end

    paid += 1

    # Total charged (food + tax + tip).
    gross_revenue += session.amount_total.to_i

    # Pre-tax, pre-tip food subtotal.
    food_subtotal, = checkout_session_breakdown(session.id)
    gross_pretax += food_subtotal

    # Stripe processing fee, from the charge's balance transaction.
    balance_txn = session.payment_intent&.latest_charge&.balance_transaction
    fees += balance_txn.fee.to_i if balance_txn
  end

  [gross_pretax, gross_revenue, fees, paid, skipped]
end

# Pre-tax deductions for refunds ISSUED in the period, regardless of when the
# original sale happened. Returns:
#   [deductible_pretax_cents, refunded_cents, refund_count, full_refund_count]
def refund_deductions(gte, lte)
  deductible = 0
  refunded   = 0
  count      = 0
  full       = 0

  Stripe::Refund.list(created: { gte: gte, lte: lte }, limit: 100).auto_paging_each do |refund|
    next unless refund.status == 'succeeded'

    count    += 1
    refunded += refund.amount.to_i

    # Find the checkout session behind this refund (via its PaymentIntent).
    session = Stripe::Checkout::Session.list(payment_intent: refund.payment_intent, limit: 1).data.first

    # Food subtotal (tip excluded)
    food_subtotal, = checkout_session_breakdown(session.id)

    if refund.amount.to_i >= session.amount_total.to_i
      # Full refund: sale undone -> deduct the whole pre-tax subtotal.
      full += 1
      deductible += food_subtotal
    else
      # Assume a partial refund is always for specific line item(s) refunded IN FULL (price + tax).
      # Since a refund amount includes tax in it, we need to account for it first.
      # To deduct it from pre-tax, pre-tip volume, remove the tax from the refund amount:
      deductible += (refund.amount.to_i / (1 + DOR_TAX_RATE)).round
    end
  end

  [deductible, refunded, count, full]
end

def main
  start_date, end_date, gte, lte = parse_args

  if STRIPE_API_KEY.nil? || STRIPE_API_KEY.empty?
    warn '!! Set STRIPE_API_KEY at the top of this script first.'
    exit 1
  end

  Stripe.api_key = STRIPE_API_KEY

  puts "Monthly close for #{start_date} .. #{end_date} (inclusive, TZ #{TIME_ZONE})"

  puts 'Fetching sales (checkout sessions created in period)...'
  gross_pretax, gross_revenue, fees, paid_sessions, skipped_unpaid = gross_sales(gte, lte)

  puts 'Fetching refunds (issued in period)...'
  refund_pretax, refunded_cents, refund_count, full_refunds = refund_deductions(gte, lte)

  net_revenue   = gross_revenue - fees - refunded_cents
  taxable_cents = gross_pretax - refund_pretax
  tax_due_cents = (taxable_cents * DOR_TAX_RATE).round

  puts
  puts '=' * 56
  puts 'MONTHLY CLOSE SUMMARY'
  puts '=' * 56
  puts "Paid orders (sold this period):    #{paid_sessions}"
  puts "Orders skipped:                    #{skipped_unpaid}"
  puts "Refunds issued this period:        #{refund_count} (#{full_refunds} full, #{refund_count - full_refunds} partial)"
  puts '-' * 56
  puts "Gross revenue (food+tax+tip):      #{dollars(gross_revenue)}"
  puts "  Less Stripe fees:                -#{dollars(fees)}"
  puts "  Less refunds:                    -#{dollars(refunded_cents)}"
  puts "Net revenue (lands in bank):       #{dollars(net_revenue)}"
  puts '-' * 56
  puts "Gross pre-tax, pre-tip revenue:    #{dollars(gross_pretax)}"
  puts "Less refund deductions (pre-tax):  -#{dollars(refund_pretax)}"
  puts "Taxable base:                      #{dollars(taxable_cents)}"
  puts "DOR rate:                          #{format('%.2f', DOR_TAX_RATE * 100)}%"
  puts "Sales tax due to DOR:              #{dollars(tax_due_cents)}"
  puts '=' * 56
end

main if $PROGRAM_NAME == __FILE__
