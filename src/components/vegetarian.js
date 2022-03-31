import * as React from "react"
import Chowfun from "../images/saigonFoodPics/saigon_deli_Chowfun_with_tofu_and_vegetables.jpg"


const Vegetarian = (props) => {
    return (
        <div className="vegetarian">
            <p className="category-name" id="vegetarian">Vegetarian Dishes</p>
            <div className="vegitems">
                <div className="names" id="vegnames">
                    {
                        props.vegetarian.map(ele => (
                            <>
                            <div className="item-price">
                                <p>{ele.Title}</p>
                                <p className="price">{ele.Price}</p>
                            </div>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Chowfun} className="pho-img" alt="Chowfun-with-tofu-and-vegetables"></img>
                <p className="desc">25. Chowfun w/ tofu & vegetables</p>
              </div>
            </div>
        </div>
    )
}

export default Vegetarian