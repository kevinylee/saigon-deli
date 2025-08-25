import Modification from "./Modification";
import Variant from "./Variant";

export default class Item {
    id: string;
    title: string;
    description: string;
    variants: Variant[];
    sizes: Modification[];
    add_ons: Modification[];

    constructor(id, title, description, variants, addOnOptions, sizeOptions) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.variants = variants;
        this.sizes = sizeOptions ?? [];
        this.add_ons = addOnOptions ?? [];
    }

    get available() {
        return this.variants.some((variant) => variant.available);
    }

    from(json) {
        return Object.assign(this, json);
    }
}