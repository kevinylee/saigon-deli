import React, { useRef, useState } from 'react';
import NewQuantitySelection from './QuantitySelection';
import { toPrice } from './utilities';
import Purchaseable from '../models/Purchaseable';
import LineItem from '../models/LineItem';

export default function AddItemModal({ item, modalRef, handleAdd, handleClose }) {
    const firstAvailableVariant = item.Variants.filter((item) => item.available)[0];
    const [selectedVariant, updateSelectedVariant] = useState(firstAvailableVariant || item.Variants[0]);

    const oneSizeAvailable = item.ItemSizes.length === 1;
    const defaultSizeId = item.ItemSizes[0].id;

    const formEl = useRef(null);

    function handleSubmit(submitEvent) {
        submitEvent.preventDefault();
        const formData = new FormData(submitEvent.target);

        const variantId = formData.get('variant');

        // The only thing we track separately along with the form data field is the variant.
        if (variantId !== selectedVariant.id) {
            alert("Unable to add item to checkout. Please try again.");
            throw new Error('Unable to add item to checkout. Please try again.');
        }

        const addOns = item.ItemAddOns.reduce((acc, option) => {
            if (formData.get(option.id)) {
                acc.push(option);
            }

            return acc;
        }, []);

        const size = item.ItemSizes.find((option) => option.id === formData.get('size'));
        const additionalNote = undefined;
        const quantity = Number(formData.get('quantity'));

        console.log(size);

        const purchaseable = new Purchaseable(selectedVariant, size, addOns, additionalNote);
        const lineItem = new LineItem(purchaseable, quantity);

        console.log(purchaseable.itemSize.id);

        submitEvent.target.reset();
        handleAdd(lineItem);
    }

    function handleCloseModal() {
        if (formEl) {
            formEl.current.reset();
        }
        handleClose();
    }

    return (
        <div ref={modalRef} className="add-item-modal-selection">
            <div className="content">
                <div className="header">
                    <h1>{item.title}</h1>
                    <button onClick={handleCloseModal}><b>X</b></button>
                </div>
                <form ref={formEl} onSubmit={handleSubmit} id="submission-form">
                    <>
                        <fieldset>
                            <p>Choice</p>
                            {item.Variants.map((variant) => (
                                <div>
                                    <input
                                        type="radio"
                                        id={variant.id}
                                        name="variant"
                                        value={variant.id}
                                        defaultChecked={selectedVariant.available && Boolean(selectedVariant.id === variant.id)}
                                        onChange={(e) => {
                                            const variant = item.Variants.find((variant) => variant.id === e.target.value)
                                            updateSelectedVariant(variant)
                                        }}
                                        disabled={!variant.available}
                                        required
                                    />
                                    {variant.available ?
                                        <label htmlFor={variant.id}>{variant.title}</label> :
                                        <label htmlFor={variant.id} className='unavailable'>{variant.title} (Out of Stock)</label>
                                    }
                                </div>
                            ))}
                        </fieldset>
                        <br />
                        <br />
                    </>
                    <fieldset>
                        <p>Size</p>
                        {oneSizeAvailable ? (
                            <>
                                <input type="radio" id="one-size" name="size" value={defaultSizeId} defaultChecked readOnly />
                                <label htmlFor="one-size">One Size {toPrice(selectedVariant.base_price)}</label>
                            </>
                        ) : (
                            item.ItemSizes.map((itemSize) => (
                                <>
                                    <input type="radio" id={itemSize.id} name="size" value={itemSize.id} defaultChecked={itemSize.id === defaultSizeId} />
                                    <label htmlFor={itemSize.id}>{itemSize.Sizes.title} {toPrice(selectedVariant.base_price + itemSize.add_price)}</label>
                                </>
                            ))
                        )}
                    </fieldset>
                    <br />
                    <br />
                    {item.ItemAddOns.length > 0 && <>
                        <fieldset>
                            <p>Add-Ons</p>
                            {item.ItemAddOns.map((itemAddOn) => (
                                <>
                                    <input type="checkbox" id={itemAddOn.id} name={itemAddOn.id} />
                                    <label htmlFor={itemAddOn.id}>{itemAddOn.AddOns.title} {toPrice(itemAddOn.add_price)}</label>
                                </>
                            ))}
                        </fieldset>
                        <br />
                        <br />
                    </>}
                    <NewQuantitySelection />
                    <div className="submission-section">
                        <button type="submit" className="add-cart-button" disabled={!firstAvailableVariant}><b>Add to cart</b></button>
                    </div>
                </form>
            </div>
        </div>
    )
}