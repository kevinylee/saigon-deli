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
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="bunprices" id="beverage-prices">
                    {
                        props.beverage.map(ele => (
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

export default Beverage