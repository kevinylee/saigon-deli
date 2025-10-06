import React, { useRef } from 'react';
import QuantitySelection from './QuantitySelection';
import AddItemModal from './AddItemModal';
import Variant from '../models/Variant';
import Item from '../models/Item';
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
            const realItem = new Item().from(item);

            return (
              <div key={`${index}-${item.title}`} className="menu-item">
                <div className="content">
                  <h4>{item.title}</h4>
                  {
                    item.description && <p>{item.description}</p>
                  }
                  {
                    JSON.stringify(realItem, null, 2)
                  }
                  <NewSelectModalButton item={realItem} addToCart={(lineItem) => {
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

const NewSelectModalButton = ({ item, addToCart, disabled }) => {
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
      <button className="select-options-button" onClick={handleOpen} disabled={!item.available} >New Select +</button>
      <AddItemModal item={item} modalRef={modalRef} handleClose={handleClose} handleAdd={handleAdd} />
    </div>
  );
}

export default Section;