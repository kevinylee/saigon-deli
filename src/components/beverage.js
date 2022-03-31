import * as React from "react"


const Beverage = (props) => {
    return (
        <div className="beverage">
            <p className="category-name" id="beverages">Beverage</p>
            <div className="vegitems">
                <div className="names" id="beverage-names">
                    {
                        props.beverage.map(ele => (
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

export default Beverage