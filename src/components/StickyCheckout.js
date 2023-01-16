import React from 'react'
import QuantitySelection from './QuantitySelection';
import './checkout.scss';

function StickyCheckout({ tips, cart, canOrder, allowCheckout, handleCheckout, onQuantityUpdate }) {

  const tipObject = tips[0];

  const cartSize = () => {
    return cart.reduce((acc, curr) => { 
      if (curr && curr.itemId && curr.quantity > 0 && curr.itemId !== tipObject.PriceId) {
        return acc += curr.quantity;
      }

      return acc;
    }, 0)
  };

  return (
    <div className="callout-wrapper">
      <div className="callout">
        <div className="content">
          <span style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
            <p>Tip Jar <span style={{ color: "#656565" }}>(in $)</span>: </p>
            <QuantitySelection id={tipObject.PriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)} />
          </span>
          {allowCheckout && 
            <button className="checkout-button" onClick={handleCheckout}>Checkout (<b>{cartSize()} items</b>)</button>
          }
        </div>
      </div>
    </div>
  );
}

export default StickyCheckout;
