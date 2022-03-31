import * as React from "react"
import Chowmein from "../images/saigonFoodPics/saigon_deli_chowmein_with_chicken_and_vegetable.jpg"

const StirFried = (props) => {
    return (
        <div className="stirfried">
            <p className="category-name" id="stirfried">Stir Fried Noodle</p>
            <p className="description">Rice or egg noodles stir fried with broccoli, carrot, and your choice of meat, seafood, or tofu.
              Served with a sprinkle of crushed peanut.</p>
            <div className="vegitems">
                <div className="names" id="stirfried-names">
                    {
                        props.stirfried.map(ele => (
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
            <div className="pics">
                <div className="img-desc">
                    <img src={Chowmein} className="pho-img" alt="chowmein-with-chicken-and-vegetables"></img>
                    <p className="desc">43. Chowmein with vegetables & chicken</p>
                </div>
            </div>
        </div>
    )
}

export default StirFried