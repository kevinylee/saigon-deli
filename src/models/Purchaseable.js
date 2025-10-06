export default class Purchaseable {
    constructor(variant, size, addOns, additionalNote) {
        this.variant = variant;
        this.size = size;
        this.addOns = addOns ?? [];
        this.additionalNote = additionalNote;
    }

    get addOnIds() {
        return this.addOns.map((addOn) => addOn.id)
    }

    get hash() {
        return `${this.variant.id}-${this.sizeId}-${this.addOnIds.toString()}-${this.additionalNote}`
    }

    get sizeId() {
        return this.size?.id || 'one-size';
    }

    get unitPrice() {
        return this.variant.base_price + (this.size?.add_price || 0) + this.addOns.reduce((acc, addOn) => acc + addOn.add_price, 0);
    }
}