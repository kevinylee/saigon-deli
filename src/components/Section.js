import React, { useRef } from 'react';
import "./section.scss";

// A two-column desktop view that collapses into a single column on mobile
const Section = (props) => {

  const items = props.items;
  const orderOnline = props.allowOrderOnline;

  // A function
  const onQuantityUpdate = props.onQuantityUpdate;

  return (
    <section id={`${props.reference}`}>
      <h2 className="category-name">{props.category}</h2>
      { 
        (props.description) && <p className="category-description">{`${props.description}`}</p> 
      }
      <div className="menu-items">
        {
          items.map((item, index) => {
            return (
              <div key={`${index}-${item.Title}`} className="menu-item">
                <div className="content">
                  <PriceColumn 
                    twoColumn={props.twoColumn} 
                    price={item.Price} 
                    smallPrice={item.SmallPrice} 
                    largePrice={item.LargePrice}  
                  />
                  <h4>{item.Title}</h4>
                  {
                    (item.Description) && <p>{item.Description}</p>
                  }
                  {
                    orderOnline && !item.Status && (item.SmallPriceId ? 
                      <div className="quantities-section">
                        <QuantitySelection title="Small" id={item.SmallPriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)}/>
                        <QuantitySelection title="Large" id={item.LargePriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)}/>
                      </div>
                      : 
                      item.ProductOptions.length === 0 ?
                       <QuantitySelection id={item.PriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)}/>
                       :
                       <SelectOptionsButton productOptions={item.ProductOptions} onQuantityUpdate={(a) => onQuantityUpdate(a)} />
                    )
                  }
                  {
                    orderOnline && item.Status && <p style={{ color: "#CCC" }}>Unavailable.</p>
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </section>
  )
};

const SelectOptionsButton = ({ productOptions, onQuantityUpdate }) => {
  const modalRef = useRef(null);

  const handleSubmit = () => {
    handleClose();
  }

  const handleClose = () => {
    if(modalRef) {
      // Hide the modal and voila!
      modalRef.current.style.display = 'none';
    }
  }

  const handleOpen = () => {
    if(modalRef) {
      // Open the modal and voila!
      modalRef.current.style.display = 'block';
    }
  };

  return (
    <div>
    <button className="select-options-button" onClick={handleOpen}>Select +</button>
      <div ref={modalRef} className="modal-selection">
        <div className="content">
          <div className="header">
            <h1>Select options</h1>
            <button onClick={handleClose}><b>X</b></button>
          </div>
          {
            productOptions.map(option => <QuantitySelection title={option.Title} id={option.PriceId} onQuantityUpdate={onQuantityUpdate} />)
          }
          <div className="submission-section">
            <button className="add-cart-button" onClick={handleSubmit}><b>Add to cart</b></button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const PriceColumn = ({ twoColumn = false, price, smallPrice, largePrice }) => {

  if (twoColumn) {
    return (
      <React.Fragment>
        <span className="large-price"> <span style={{ color: '#CCC' }}>/</span> <b><u>L</u></b> {largePrice}</span>
        <span className="small-price"><b><u>S</u></b> {smallPrice}</span>
      </React.Fragment>
    )
  }

  return (
    <span className="price">{price}</span>
  )
};

export default Section;