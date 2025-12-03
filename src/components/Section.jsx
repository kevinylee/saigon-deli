import React, { useRef } from 'react';
import AddItemModal from './AddItemModal';
import "./section.scss";
import { toPrice } from './utilities';

function displayPrice(item) {
  const lowestValue = Math.min(...item.Variants.map((variant) => variant.base_price))

  return toPrice(lowestValue);
}

// A two-column desktop view that collapses into a single column on mobile
const Section = ({ section, onLineItemAdd, reference, category }) => {
  const items = section.Items;

  return (
    <section id={`${reference}`}>
      <h2 className="category-name">{category}</h2>
      {
        section.description && <p className="category-description">{`${section.description}`}</p>
      }
      <div className="menu-items">
        {
          items.map((item, index) => {
            return (
              <div key={`${index}-${item.title}`} className="menu-item">
                <div className="content">
                  <span className="price">{displayPrice(item)}</span>
                  <h4>{item.title}</h4>
                  {
                    item.description && <p>{item.description}</p>
                  }
                  <SelectModalButton item={item} addToCart={(lineItem) => {
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

const SelectModalButton = ({ item, addToCart, disabled }) => {
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

  return (
    <div>
      <button className="select-options-button" onClick={handleOpen} >Add Item +</button>
      <AddItemModal item={item} modalRef={modalRef} handleClose={handleClose} handleAdd={handleAdd} />
    </div>
  );
}

export default Section;