// Add-on or size
export default class Modification {
    id: string;
    add_price: number;

    constructor(id, add_price) {
        this.id = id;
        this.add_price = add_price;
    }
}