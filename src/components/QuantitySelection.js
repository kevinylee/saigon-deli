import React, { useRef } from 'react';

const QuantitySelection = ({ id, onQuantityUpdate, title }) => {
  /*: MutableRefObject<HTMLInputElement>*/
  const inputEl = useRef(null);

  function handleIncreaseQuantity() {
    if(inputEl) {
      inputEl.current.stepUp();
      onQuantityUpdate(id)({
        target: { 
          value: inputEl.current.value
        }
      });
    }
  }

  function handleDecreaseQuantity() {
    if(inputEl) {
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
      {title && <p>{title}:</p>}
      <button onClick={handleDecreaseQuantity}>-</button>
      <input ref={inputEl} className="quantity-input" type="number" id={`${id}-quantity`} min={0} max={10} step={1} defaultValue={0} onChange={onQuantityUpdate(id)} />
      <button onClick={handleIncreaseQuantity}>+</button>
    </div>
  )
};

export default QuantitySelection; 