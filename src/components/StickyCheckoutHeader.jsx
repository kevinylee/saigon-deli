import React from 'react';
import './checkout.scss';

export default function StickyCheckoutHeader({ tipVariant, cart, onOpenCheckoutModal }) {
    const totalSize = cart.filter((lineItem) => lineItem.purchaseable.variant.id !== tipVariant.id).reduce((acc, lineItem) => acc + lineItem.quantity, 0);

    return (
        <div className="callout-wrapper">
            <div className="callout">
                <div className="content">
                    <span className="order-pickup-label">ORDER PICKUP</span>
                    <button className="checkout-button" onClick={onOpenCheckoutModal}>Checkout {totalSize} items</button>
                </div>
            </div>
        </div>
    )
}
