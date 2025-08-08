export default class Variant {
    constructor(id, title, description, basePrice, sizeOptions, addOnOptions, available) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.sizeOptions = sizeOptions ?? [];
        this.addOnOptions = addOnOptions ?? [];
        this.available = available;
        this.basePrice = basePrice;
    }
}