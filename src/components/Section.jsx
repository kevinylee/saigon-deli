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
                  {/* {
                    item.variants.length === 1 ?
                      (<QuantitySelection id={item.variants[0].id} disabled={!item.variants[0].available} onQuantityUpdate={(a) => onQuantityUpdate(a)} />) :
                      (<SelectOptionsButton variants={item.variants} onQuantityUpdate={(a) => onQuantityUpdate(a)} />)
                  }
                  {
                    orderOnline && item.available && <p style={{ color: "#CCC" }}>Unavailable.</p>
                  } */}
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

  const sizeOptions = [{ id: "small", add_price: 100 }, { id: "large", add_price: 200 }];

  const addOnOptions = [{
    "id": "add-egg",
    "add_price": 100
  },
  {
    "id": "extra-meat",
    "add_price": 100
  }]

  // const shrimp = new Variant('variant-spring-rolls-with-shrimp', 'Spring Roll with Shrimp', 'Flavorful food', 100, sizeOptions, addOnOptions, true);
  // const chicken = new Variant('variant-spring-rolls-with-chicken', 'Spring Roll with Chicken', 'Flavorful food', 100, sizeOptions, addOnOptions, true);
  // const tofu = new Variant('variant-spring-rolls-with-tofu', 'Spring Roll with Tofu', 'Flavorful food', 100, sizeOptions, addOnOptions, true);

  // const item = new Item('item-test-id', 'Spring Roll', 'Delicious spring rolls', [shrimp, chicken, tofu], addOnOptions, null);

  return (
    <div>
      {item.available}
      <button className="select-options-button" onClick={handleOpen} disabled={!item.available} >New Select +</button>
      <AddItemModal item={item} modalRef={modalRef} handleClose={handleClose} handleAdd={handleAdd} />
    </div>
  );
}

export default Section;