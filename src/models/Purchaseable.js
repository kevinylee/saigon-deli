export default class Purchaseable {
    constructor(variant, itemSize, itemAddOns, additionalNote) {
        this.variant = variant;
        this.itemSize = itemSize;
        this.itemAddOns = itemAddOns ?? [];
        this.additionalNote = additionalNote;
    }

    get addOnIds() {
        return this.itemAddOns.map((addOn) => addOn.id)
    }

    get hash() {
        return `${this.variant.id}-${this.itemSize.id}-${this.addOnIds.toString()}-${this.additionalNote}`
    }

    get unitPrice() {
        let price = this.variant.base_price;

        if (this.variant.title !== 'Tip') {
            const modifications = (this.itemSize.add_price || 0) + this.itemAddOns.reduce((acc, addOn) => acc + addOn.add_price, 0);

            price += modifications;
        }

        return price;
    }
}