export default class Variant {
    constructor(id, title, description, basePrice, sizeOptions, addOnOptions, available) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.sizes = sizeOptions ?? [];
        this.add_ons = addOnOptions ?? [];
        this.available = available;
        this.base_price = basePrice;
    }
}