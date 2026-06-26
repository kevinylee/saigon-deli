import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { DateTime, Duration } from 'luxon';
import { toPrice, BASE_URL } from './utilities';
import PickupAt from './PickupAt';
import Purchaseable from '../models/Purchaseable';
import LineItem from '../models/LineItem';

function LineItemPreview({ lineItem, onRemove }) {
    const { variant, unitPrice, itemAddOns, itemSize } = lineItem.purchaseable;

    const displaySize = itemSize.Sizes.title === 'One Size' ? undefined : itemSize.Sizes.title;

    return (
        <li className="line-item-preview">
            <div className="line-item-text">
                <div className="line-item-title"><b>{lineItem.quantity}</b> {displaySize} {variant.title}: {toPrice(lineItem.quantity * unitPrice)}</div>
                {itemAddOns.length > 0 ?
                    <div className="line-item-subtext">{itemAddOns.map((itemAddOn) => itemAddOn.AddOns.title).join(', ')}</div> :
                    <div className="line-item-subtext">(No add-ons)</div>
                }
            </div>
            <button onClick={() => onRemove(lineItem)}>x</button>
        </li >
    );
}

export default function CheckoutModal({ cart, tipVariant, canOrder = true, onClose, onLineItemRemove }) {
    const THIRTY_MINUTE_DURATION = Duration.fromObject({ minutes: 15 });

    // Fake ISO8601 without the timezone. Ugly!
    const DEFAULT_TIME = DateTime.now().plus(THIRTY_MINUTE_DURATION).toFormat("yyyy-MM-dd'T'HH:mm");

    const [pickupTime, setPickupTime] = useState(DEFAULT_TIME);
    const [tipAmount, setTipAmount] = useState(0);

    const TAX_RATE_PERCENT = Number(process.env.GATSBY_TAX_RATE_PERCENT) || 10.55;

    const cartSubtotal = cart.reduce((acc, lineItem) => acc + (lineItem.quantity * lineItem.purchaseable.unitPrice), 0);

    // Per-line rounding to match Stripe's TaxRate calculation exactly
    const taxCents = cart.reduce((acc, lineItem) => {
        const lineCents = lineItem.quantity * lineItem.purchaseable.unitPrice;
        return acc + Math.round(lineCents * TAX_RATE_PERCENT / 100);
    }, 0);

    const tipCents = Math.round(Math.max(0, tipAmount) * 100);
    const totalPrice = cartSubtotal + taxCents + tipCents;

    const isValidTime = () => {
        if (process.env.NODE_ENV === 'development') {
            return true;
        }

        const luxonPickupTime = DateTime.fromISO(pickupTime, { zone: "America/Los_Angeles" });

        // If it's in the future and within the default working hours.
        return luxonPickupTime > DateTime.now() && luxonPickupTime.hour >= 11 && luxonPickupTime.hour <= 20;
    }

    async function handleCheckout() {
        const stripe = await loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY);

        if (cart.length > 0 && stripe && canOrder) {
            const dateTime = DateTime.fromISO(pickupTime, { zone: "America/Los_Angeles" });

            const lineItems = tipCents > 0
                ? [...cart, new LineItem(new Purchaseable(tipVariant, tipVariant.Items.ItemSizes[0], null, null), tipAmount)]
                : cart;

            const response = await axios.post(`${BASE_URL}/.netlify/functions/checkout`, {
                lineItems,
                pickupTime: dateTime.toISO().toString()
            })

            if (response.data) {
                const result = await stripe.redirectToCheckout({
                    sessionId: response.data.sessionId
                });

                if (result.error) {
                    alert(result.error.message)
                }
            }
        } else {
            alert("Please check that you have added items to your cart and that Saigon Deli is open. If so, feel free to call us to put in the order.");
        }
    }

    return (
        <div className="checkout-modal-selection">
            <div className="content">
                <div className="header">
                    <h1>Checkout</h1>
                    <button onClick={onClose}><b>X</b></button>
                </div>
                <div style={{ marginBottom: 24 }}>
                    <ul>
                        {cart.map((lineItem) => (<LineItemPreview lineItem={lineItem} onRemove={onLineItemRemove} />))}
                        {cart.length <= 0 && <li>No items selected</li>}
                    </ul>
                </div>
                <div className="modal-section">
                    <p className="modal-section-label">Pickup Time</p>
                    <PickupAt time={pickupTime} minDateTime={DEFAULT_TIME} onTimeChange={setPickupTime} />
                </div>
                <div className="tip-section">
                    <p className="modal-section-label">Add a Tip</p>
                    <div className="tip-presets">
                        {[10, 15, 20].map(pct => (
                            <button
                                key={pct}
                                type="button"
                                className="tip-preset-button"
                                onClick={() => setTipAmount(Math.round(cartSubtotal * pct / 100) / 100)}
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>
                </div>
                <div className="checkout-footer">
                    <div className="checkout-totals">
                        <div className="totals-row">
                            <span>Subtotal</span>
                            <span>{toPrice(cartSubtotal)}</span>
                        </div>
                        <div className="totals-row">
                            <span>Sales Tax ({TAX_RATE_PERCENT}%)</span>
                            <span>{toPrice(taxCents)}</span>
                        </div>
                        <div className="totals-row tip-row">
                            <div className="tip-form">
                                <span><b>Tip</b>: $</span>
                                <input
                                    type="number"
                                    value={tipAmount}
                                    onChange={(e) => setTipAmount(Math.max(0, Number(e.target.value)))}
                                    min="0"
                                    step="0.01"
                                    className="tip-input"
                                />
                            </div>
                            <span>{toPrice(tipCents)}</span>
                        </div>
                        <div className="totals-row total-row">
                            <span><b>Total</b></span>
                            <span><b>{toPrice(totalPrice)}</b></span>
                        </div>
                    </div>
                    <div className="checkout">
                        <button disabled={!canOrder || cart.length <= 0 || !isValidTime()} style={{ fontSize: "1.15rem" }} onClick={handleCheckout}>Checkout</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
