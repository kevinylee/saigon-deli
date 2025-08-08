export default class LineItem {
    constructor(purchaseable, quantity) {
        this.purchaseable = purchaseable;
        this.quantity = quantity;
        this.unitPrice = purchaseable.unitPrice;
    }

    get variantId() {
        return this.purchaseable.variant.id;
    }

    set setQuantity(num) {
        this.quantity = num;
    }
}