import * as React from "react"
import Spring from "../images/saigonFoodPics/saigon_deli_spring_roll_with_shrimp.jpg"
import Rolls from "../images/saigonFoodPics/saigon_deli_Eggroll.jpg"
import Combo from "../images/saigonFoodPics/saigon_deli_Combo_Sandwich_with_Wonton_soup.jpg"


const Appetizers = (props) => {
    return (
        <div className="appetizers">
            <p className="category-name" id="appetizers">Appetizers</p>
            <div className="appe-items">
                <div className="name-desc">
                    {
                        props.a.map(ele => (
                            <>
                            <div className="item-price">
                              <p className="appename">{ele.Title}</p>
                              <p>{ele.Price}</p>
                            </div>
                            <p className="desc">{ele.Description}</p>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Spring} className="pho-img" alt="spring-rolls"></img>
                <p className="desc">1. Spring Rolls - Goi Cuon</p>
              </div>
              <div className="img-desc">
                <img src={Rolls} className="pho-img" alt="egg-rolls"></img>
                <p className="desc">2. Vegetarian Egg Rolls</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={Combo} className="pho-img" alt="sandwich-wonton"></img>
                <p className="desc">3A. COMBO: Sandwich & Wonton soup</p>
              </div>
            </div>
        </div>
    )
}

export default Appetizers