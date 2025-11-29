import React, { useRef } from 'react';

const NewQuantitySelection = ({ fieldName = "quantity", defaultValue = 1 }) => {
    const inputEl = useRef(null);

    function handleIncreaseQuantity() {
        if (inputEl) {
            inputEl.current.stepUp();
        }
    }

    function handleDecreaseQuantity() {
        if (inputEl) {
            inputEl.current.stepDown();
        }
    }

    return (
        <fieldset className="quantity-selection">
            <button type="button" onClick={handleDecreaseQuantity}>-</button>
            <input
                ref={inputEl}
                name={fieldName}
                className="quantity-input"
                type="number" min={0} max={20} step={1}
                defaultValue={defaultValue}
                onChange={(e) => { console.log(e) }} />
            <button type="button" onClick={handleIncreaseQuantity}>+</button>
        </fieldset>
    )
};

export default NewQuantitySelection; 