import * as React from "react"

const HuTieu = (props) => {
    return (
        <div className="hutieu">
            <p className="category-name" id="noodlesoup">Hu Tieu (noodle soup)</p>
            <p className="description">Rice or egg noodles in a pork broth, broccoli, and your choice of meat, seafood, or tofu.</p>
            <div className="vegitems">
                <div className="names" id="hutieu-names">
                    {
                        props.hutieu.map(ele => (
                            <>
                            <div className="item-price">
                                <p className="item">{ele.Title}</p>
                                <p className="price">{ele.Price}</p>
                            </div>
                            </>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default HuTieu