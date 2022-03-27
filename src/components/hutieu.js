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
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="bunprices" id="hutieu-prices">
                    {
                        props.hutieu.map(ele => (
                            <>
                            <p>{ele.Price}</p>
                            </>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default HuTieu