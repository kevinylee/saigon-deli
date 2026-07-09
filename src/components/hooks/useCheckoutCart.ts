import { useState } from "react";
import LineItem from "../../models/LineItem";

export const upsertLineItem = (cart: LineItem[], lineItem: LineItem) => {
    const { purchaseable, quantity } = lineItem;
    const isTracked = cart.some(existingItem => existingItem.purchaseable.hash === purchaseable.hash);

    if (quantity === 0) {
        return removeLineItem(cart, lineItem);
    }

    if(!isTracked) {
        return [...cart, lineItem];
    }

    return cart.map(existing => existing.purchaseable.hash === purchaseable.hash ? lineItem : existing)
};

// A full removal for now
export const removeLineItem = (cart: LineItem[], lineItem: LineItem) => {
    return cart.filter((curr) => curr.purchaseable.hash !== lineItem.purchaseable.hash)
};

export function useCheckoutCart() {
    const [cart, updateCart] = useState<LineItem[]>([]);

    return {
        cart,
        upsert: (lineItem: LineItem) => updateCart(prev => upsertLineItem(prev, lineItem)),
        remove: (lineItem: LineItem) => updateCart(prev => removeLineItem(prev, lineItem))
    }
}