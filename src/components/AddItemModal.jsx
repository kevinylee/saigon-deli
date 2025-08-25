import React, { useRef } from 'react';
import NewQuantitySelection from './NewQuantitySelection';
import { toPrice, PRETTY } from './utilities';
import Purchaseable from '../models/Purchaseable';
import LineItem from '../models/LineItem';

// class Variant {
//     constructor(id, title, description, sizeOptions, addOnOptions) {
//         this.id = id;
//         this.title = title;
//         this.description = description;
//         this.sizeOptions = sizeOptions ?? [];
//         this.addOnOptions = addOnOptions ?? [];
//     }
// }

// An item for checkout
// class Purchaseable {
//     constructor(variant, size, addOns, additionalNote) {
//         this.variant = variant;
//         this.size = size;
//         this.addOns = addOns;
//         this.additionalNote = additionalNote;
//     }

//     get addOnIds() {
//         return this.addOns.map((addOn) => addOn.id)
//     }

//     get hash() {
//         return `${this.variant.id}-${this.size.id}-${this.addOnIds.toString()}-${this.additionalNote}`
//     }

//     get unitPrice() {
//         return this.size.add_price + this.addOns.reduce((acc, addOn) => acc + addOn.add_price, 0);
//     }
// }

// // An item & quantity in the checkout cart
// class LineItem {
//     constructor(purchaseable, quantity) {
//         this.purchaseable = purchaseable;
//         this.quantity = quantity;
//     }

//     set setQuantity(num) {
//         this.quantity = num;
//     }
// }

const ONE_SIZE_CODE = 'one-size';

export default function AddItemModal({ item, modalRef, handleAdd, handleClose }) {
    const defaultSize = item.sizes?.length > 0 ? item.sizes[0].id : ONE_SIZE_CODE;
    const formEl = useRef(null);

    function handleSubmit(submitEvent) {
        submitEvent.preventDefault();
        const formData = new FormData(submitEvent.target);

        const variantId = item.variants.length === 1 ? item.variants[0].id : formData.get('variant');
        const variant = item.variants.find((variant) => variant.id === variantId);

        const addOns = item.add_ons.reduce((acc, option) => {
            if (formData.get(option.id)) {
                acc.push(option);
            }

            return acc;
        }, []);

        const size = item.sizes?.find((option) => option.id === formData.get('size')) || ONE_SIZE_CODE;
        const additionalNote = undefined;
        const quantity = Number(formData.get('quantity'));

        const purchaseable = new Purchaseable(variant, size, addOns, additionalNote);
        const lineItem = new LineItem(purchaseable, quantity);

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
        <div ref={modalRef} className="modal-selection">
            <div className="content">
                <div className="header">
                    <h1>{item.title}</h1>
                    <button onClick={handleCloseModal}><b>X</b></button>
                </div>
                <form ref={formEl} onSubmit={handleSubmit} id="submission-form">
                    {
                        item.variants.length !== 1 &&
                        <>
                            <fieldset>
                                <p>Choice</p>
                                {item.variants.map((variant) => (
                                    <div>
                                        <input type="radio" id={variant.id} name="variant" value={variant.id} disabled={!variant.available} required />
                                        {variant.available ? <label htmlFor={variant.id}>{variant.title}</label> : <label htmlFor={variant.id} className='unavailable'>{variant.title}</label>}
                                    </div>
                                ))}
                            </fieldset>
                            <br />
                            <br />
                        </>
                    }
                    <fieldset disabled={defaultSize === ONE_SIZE_CODE}>
                        <p>Size:</p>
                        {defaultSize === ONE_SIZE_CODE ? (
                            <>
                                <input type="radio" id={ONE_SIZE_CODE} name="size" defaultChecked disabled />
                                <label htmlFor={ONE_SIZE_CODE}>One Size {toPrice(item.base_price)}</label>
                            </>
                        ) : (
                            item.sizes.map((sizeOption) => (
                                <>
                                    <input type="radio" id={sizeOption.id} name="size" value={sizeOption.id} defaultChecked={sizeOption.id === defaultSize} />
                                    <label htmlFor={sizeOption.id}>{PRETTY[sizeOption.id]} {toPrice(sizeOption.add_price)}</label>
                                </>
                            ))
                        )}
                    </fieldset>
                    <br />
                    <br />
                    {item.add_ons.length > 0 && <>
                        <fieldset>
                            <p>Add-Ons</p>
                            {item.add_ons.map((addOnOption) => (
                                <>
                                    <input type="checkbox" id={addOnOption.id} name={addOnOption.id} />
                                    <label htmlFor={addOnOption.id}>{PRETTY[addOnOption.id]} {toPrice(addOnOption.add_price)}</label>
                                </>
                            ))}

                        </fieldset>
                        <br />
                        <br />
                    </>}
                    <NewQuantitySelection />
                    <div className="submission-section">
                        <button type="submit" className="add-cart-button"><b>Add to cart</b></button>
                    </div>
                </form>
            </div>
        </div>
    )
}