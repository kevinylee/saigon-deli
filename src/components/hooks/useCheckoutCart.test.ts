import { describe, expect, test } from 'vitest'
import { upsertLineItem, removeLineItem } from './useCheckoutCart';
import LineItem from '../../models/LineItem';
import Purchaseable from '../../models/Purchaseable';

const makeLineItem = (variantId: number, quantity: number, itemSizeId = 1) => {
    const variant = { id: variantId, title: 'Test', base_price: 100 };
    const itemSize = { id: itemSizeId, add_price: 0 };
    const purchaseable = new Purchaseable(variant, itemSize, [], null);
    return new LineItem(purchaseable, quantity);
};

describe('upsertLineItem', () => {
    test('appends a new item when the cart is empty', () => {
        const item = makeLineItem(1, 2);
        expect(upsertLineItem([], item)).toEqual([item]);
    });

    test('appends a new item alongside existing ones', () => {
        const existing = makeLineItem(1, 1);
        const added = makeLineItem(2, 1);
        expect(upsertLineItem([existing], added)).toEqual([existing, added]);
    });

    test('treats the same variant with different sizes as separate items', () => {
        const small = makeLineItem(1, 1, 1); 
        const large = makeLineItem(1, 1, 2);

        expect(small.purchaseable.hash).not.toBe(large.purchaseable.hash);
        expect(upsertLineItem([small], large)).toEqual([small, large]);
    });

    test('updates the quantity of a tracked item instead of duplicating it', () => {
        const original = makeLineItem(1, 1);
        const updated = makeLineItem(1, 5);
        const result = upsertLineItem([original], updated);

        expect(result).toHaveLength(1);
        expect(result[0].quantity).toBe(5);
    });

    test('updates only the matching item and preserves the others and their order', () => {
        const a = makeLineItem(1, 1);
        const b = makeLineItem(2, 1);
        const c = makeLineItem(3, 1);
        const bUpdated = makeLineItem(2, 9);

        expect(upsertLineItem([a, b, c], bUpdated)).toEqual([a, bUpdated, c]);
    });

    test('removes a tracked item when quantity is 0', () => {
        const a = makeLineItem(1, 2);
        const b = makeLineItem(2, 2);
        const remove = makeLineItem(1, 0);

        expect(upsertLineItem([a, b], remove)).toEqual([b]);
    });

    test('returns the cart unchanged when quantity is 0 for an untracked item', () => {
        const a = makeLineItem(1, 2);
        const untracked = makeLineItem(9, 0);

        expect(upsertLineItem([a], untracked)).toEqual([a]);
    });

    test('does not mutate the input cart', () => {
        const a = makeLineItem(1, 1);
        const cart = [a];
        upsertLineItem(cart, makeLineItem(2, 1));

        expect(cart).toEqual([a]);
        expect(cart).toHaveLength(1);
    });
});

describe('removeLineItem', () => {
    test('removes the matching item', () => {
        const a = makeLineItem(1, 1);
        const b = makeLineItem(2, 1);

        expect(removeLineItem([a, b], a)).toEqual([b]);
    });

    test('leaves the cart unchanged when the item is not present', () => {
        const a = makeLineItem(1, 1);
        const notInCart = makeLineItem(9, 1);

        expect(removeLineItem([a], notInCart)).toEqual([a]);
    });

    test('returns an empty array when removing from an empty cart', () => {
        expect(removeLineItem([], makeLineItem(1, 1))).toEqual([]);
    });

    test('removes only the matching hash, keeping same-quantity siblings', () => {
        const a = makeLineItem(1, 1);
        const b = makeLineItem(2, 1);
        const c = makeLineItem(3, 1);

        expect(removeLineItem([a, b, c], b)).toEqual([a, c]);
    });

    test('removes only the matching size, keeping the same variant in another size', () => {
        const small = makeLineItem(1, 1, 1); // variant 1, size 1
        const large = makeLineItem(1, 1, 2); // variant 1, size 2 -> different hash

        expect(removeLineItem([small, large], small)).toEqual([large]);
    });

    test('does not mutate the input cart', () => {
        const a = makeLineItem(1, 1);
        const b = makeLineItem(2, 1);
        const cart = [a, b];
        removeLineItem(cart, a);

        expect(cart).toEqual([a, b]);
        expect(cart).toHaveLength(2);
    });
});
