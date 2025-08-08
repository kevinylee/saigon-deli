import React, { useRef } from 'react';
import QuantitySelection from './QuantitySelection';
import AddItemModal from './AddItemModal';
import Variant from '../models/Variant';
import "./section.scss";

// A two-column desktop view that collapses into a single column on mobile
const Section = ({ section, allowOrderOnline, onQuantityUpdate, onLineItemAdd, description, reference, category }) => {

  const items = section?.items ?? [];

  return (
    <section id={`${reference}`}>
      <h2 className="category-name">{category}</h2>
      {
        (description) && <p className="category-description">{`${description}`}</p>
      }
      <div className="menu-items">
        {
          items.map((item, index) => {
            return (
              <div key={`${index}-${item.title}`} className="menu-item">
                <div className="content">
                  <h4>{item.title}</h4>
                  {
                    item.description && <p>{item.description}</p>
                  }
                  {
                    JSON.stringify(item)
                  }
                  {/* {
                    orderOnline && !item.available && (item.SmallPriceId ?
                      <div className="quantities-section">
                        <QuantitySelection title="Small" id={item.SmallPriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)} />
                        <QuantitySelection title="Large" id={item.LargePriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)} />
                      </div>
                      :
                      item.ProductOptions.length === 0 ?
                        <QuantitySelection id={item.PriceId} onQuantityUpdate={(a) => onQuantityUpdate(a)} />
                        :
                        <SelectOptionsButton productOptions={item.ProductOptions} onQuantityUpdate={(a) => onQuantityUpdate(a)} />
                    )
                  } */}
                  {/* How do we update size selection and keep the existing UI? By updating the cart logic */}
                  {/* What does it look like to use add-ons? It would probably be an additional modal */}
                  {/* {
                    item.variants.length === 1 ?
                      (<QuantitySelection id={item.variants[0].id} disabled={!item.variants[0].available} onQuantityUpdate={(a) => onQuantityUpdate(a)} />) :
                      (<SelectOptionsButton variants={item.variants} onQuantityUpdate={(a) => onQuantityUpdate(a)} />)
                  }
                  {
                    orderOnline && item.available && <p style={{ color: "#CCC" }}>Unavailable.</p>
                  } */}
                  <NewSelectModalButton addToCart={(lineItem) => {
                    onLineItemAdd(lineItem)
                  }} />
                </div>
              </div>
            )
          })
        }
      </div>
    </section>
  )
};

const NewSelectModalButton = ({ addToCart, disabled }) => {
  const modalRef = useRef(null);

  const handleAdd = (lineItem) => {
    addToCart(lineItem);
    handleClose();
  }

  const handleClose = () => {
    if (modalRef) {
      // Hide the modal and voila!
      modalRef.current.style.display = 'none';
    }
  }

  const handleOpen = () => {
    if (modalRef) {
      // Open the modal and voila!
      modalRef.current.style.display = 'block';
    }
  };

  const sizeOptions = [{ id: "small", add_price: 100 }, { id: "large", add_price: 200 }];

  const addOnOptions = [{
    "id": "add-egg",
    "add_price": 100
  },
  {
    "id": "extra-meat",
    "add_price": 100
  }]

  const item = new Variant('test-id', 'Pho with Beef', 'Flavorful food', 100, sizeOptions, addOnOptions, true);

  return (
    <div>
      <button className="select-options-button" onClick={handleOpen} disabled={disabled || !item.available} >New Select +</button>
      <AddItemModal item={item} modalRef={modalRef} handleClose={handleClose} handleAdd={handleAdd} />
    </div>
  );
}

const SelectOptionsButton = ({ variants, onQuantityUpdate }) => {
  const modalRef = useRef(null);

  const handleSubmit = () => {
    handleClose();
  }

  const handleClose = () => {
    if (modalRef) {
      // Hide the modal and voila!
      modalRef.current.style.display = 'none';
    }
  }

  const handleOpen = () => {
    if (modalRef) {
      // Open the modal and voila!
      modalRef.current.style.display = 'block';
    }
  };

  return (
    <div>
      <button className="select-options-button" onClick={handleOpen}>Select +</button>
      <div ref={modalRef} className="add-item-modal modal-selection">
        <div className="content">
          <div className="header">
            <h1>Select options</h1>
            <button onClick={handleClose}><b>X</b></button>
          </div>
          {
            variants.map(variant => <QuantitySelection title={variant.title} disabled={!variant.available} id={variant.id} onQuantityUpdate={onQuantityUpdate} />)
          }
          <div className="submission-section">
            <button className="add-cart-button" onClick={handleSubmit}><b>Add to cart</b></button>
          </div>
        </div>
      </div>
    </div>
  );
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