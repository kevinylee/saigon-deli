import * as React from "react"
import Friedrice from "../images/saigonFoodPics/saigon_deli_Fried_rice_with_shrimp.jpg"


const FriedRice = (props) => {
    return (
        <div className="friedrice">
            <p className="category-name" id="friedrice">Fried Rice</p>
            <p className="description">Our fried rice is cooked with egg, mixed peas and your choice of meat.</p>
            <div className="vegitems">
                <div className="names" id="friedrice-names">
                    {
                        props.friedrice.map(ele => (
                            <>
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="bunprices" id="friedrice-prices">
                    {
                        props.friedrice.map(ele => (
                            <>
                            <p>{ele.Price}</p>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
                <div className="img-desc">
                    <img src={Friedrice} className="pho-img" alt="friedrice-with-shrimp"></img>
                    <p className="desc">65. Fried rice with shrimp</p>
                </div>
            </div>
        </div>
    )
}

export default FriedRice