import React, { useRef } from 'react';

const QuantitySelection = ({ id, onQuantityUpdate, title, disabled }) => {
  /*: MutableRefObject<HTMLInputElement>*/
  const inputEl = useRef(null);

  function handleIncreaseQuantity() {
    if (inputEl) {
      inputEl.current.stepUp();
      onQuantityUpdate(id)({
        target: {
          value: inputEl.current.value
        }
      });
    }
  }

  function handleDecreaseQuantity() {
    if (inputEl) {
      inputEl.current.stepDown();
      onQuantityUpdate(id)({
        target: {
          value: inputEl.current.value
        }
      });
    }
  }

  return (
    <div className="quantity-selection">
      {title && <p>{title}{disabled && " (Unavailable)"}:</p>}
      <button disabled={disabled} onClick={handleDecreaseQuantity}>-</button>
      <input disabled={disabled} ref={inputEl} className="quantity-input" type="number" id={`${id}-quantity`} min={0} max={10} step={1} defaultValue={0} onChange={onQuantityUpdate(id)} />
      <button disabled={disabled} onClick={handleIncreaseQuantity}>+</button>
    </div>
  )
};

export default QuantitySelection; 