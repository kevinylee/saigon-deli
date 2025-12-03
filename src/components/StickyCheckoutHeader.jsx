import React, { useRef } from 'react';
import QuantitySelection from './QuantitySelection';
import Purchaseable from '../models/Purchaseable';
import LineItem from '../models/LineItem';
import './checkout.scss';

export default function StickyCheckoutHeader({ tipVariant, cart, onOpenCheckoutModal, onTipChange }) {
    const totalSize = cart.filter((lineItem) => lineItem.purchaseable.variant.id !== tipVariant.id).reduce((acc, lineItem) => acc + lineItem.quantity, 0);
    const formEl = useRef(null);

    const handleCheckout = () => {
        // Only add/remove tip from cart on checkout click! No need to have it auto-updated on anything else.
        if (formEl) {
            const formData = new FormData(formEl.current);
            const tipAmount = Number(formData.get('tip'));

            const tipPurchaseable = new Purchaseable(tipVariant, tipVariant.Items.ItemSizes[0], null, null);
            const tipLineItem = new LineItem(tipPurchaseable, tipAmount);

            onTipChange(tipLineItem)

            onOpenCheckoutModal();
        }
    }

    return (
        <div className="callout-wrapper">
            <div className="callout">
                <div className="content">
                    <span style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <p>Tip Jar <span style={{ color: "#656565" }}>(in $)</span>: </p>
                        <form ref={formEl}>
                            <QuantitySelection fieldName="tip" defaultValue={0} />
                        </form>
                    </span>
                    <button className="checkout-button" onClick={handleCheckout} >Checkout {totalSize} items</button>
                </div>
            </div>
        </div>
    )
}