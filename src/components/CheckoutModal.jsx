import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { DateTime, Duration } from 'luxon';
import { toPrice, BASE_URL } from './utilities';
import PickupAt from './PickupAt';

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
    const THIRTY_MINUTE_DURATION = Duration.fromObject({ minutes: 30 });

    // Fake ISO8601 without the timezone. Ugly!
    const DEFAULT_TIME = DateTime.now().plus(THIRTY_MINUTE_DURATION).toFormat("yyyy-MM-dd'T'HH:mm");

    const [pickupTime, setPickupTime] = useState(DEFAULT_TIME);
    const cartWithoutTip = cart.filter((lineItem) => lineItem.variantId !== tipVariant.id)
    const totalPrice = cart.reduce((acc, lineItem) => acc + (lineItem.quantity * lineItem.purchaseable.unitPrice), 0)

    // Calculate the tip specifically to show as well.
    const totalTip = () => {
        const tipItem = cart.find((lineItem) => lineItem.variantId === tipVariant.id);

        if (tipItem) {
            return tipItem.quantity * tipItem.purchaseable.unitPrice;
        } else {
            return 0;
        }
    }

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

            const response = await axios.post(`${BASE_URL}/.netlify/functions/checkout`, {
                lineItems: cart,
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
                <div style={{ marginBottom: 96 }}>
                    <ul>
                        {cartWithoutTip.map((lineItem) => (<LineItemPreview lineItem={lineItem} onRemove={onLineItemRemove} />))}
                        {cartWithoutTip.length <= 0 && <li>No items selected</li>}
                    </ul>
                </div>
                <PickupAt time={pickupTime} minDateTime={DEFAULT_TIME} onTimeChange={setPickupTime} />
                <br />
                <div className="checkout-footer">
                    <span>
                        <b>Tip</b>: {toPrice(totalTip())}
                        <br />
                        <b>Total</b>: {toPrice(totalPrice)}
                    </span>
                    <button disabled={cartWithoutTip.length <= 0 || !isValidTime()} style={{ fontSize: "1.15rem" }} onClick={handleCheckout}>Checkout</button>
                </div>
            </div>
        </div>
    )
}