import React, { useRef } from 'react';
import NewQuantitySelection from './NewQuantitySelection';
import Purchaseable from '../models/Purchaseable';
import LineItem from '../models/LineItem';
import Variant from '../models/Variant';
import './checkout.scss';

const TipVariant = new Variant("tip", "Tip", undefined, 100, null, null, true);

export default function NewStickyCheckoutHeader({ cart, onOpenCheckoutModal, onTipChange }) {
    const totalSize = cart.filter((lineItem) => lineItem.variantId !== 'tip').reduce((acc, lineItem) => acc + lineItem.quantity, 0);
    const formEl = useRef(null);

    const handleCheckout = () => {
        // Only add/REMOVE tip from cart on checkout click! Don't need to worry about it during the day-to-day
        if (formEl) {
            const formData = new FormData(formEl.current);
            // get tip value
            // add to cart

            const tipAmount = Number(formData.get('tip'));

            const tipPurchaseable = new Purchaseable(TipVariant, null, null, null);
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
                            <NewQuantitySelection fieldName="tip" defaultValue={0} />
                        </form>
                    </span>
                    <button className="checkout-button" onClick={handleCheckout} >Checkout {totalSize} items</button>
                </div>
            </div>
        </div>
    )
}