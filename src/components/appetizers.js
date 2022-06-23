import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"

const Appetizers = (props) => {
    return (
        <div className="appetizers">
            <p className="category-name" id="appetizers">Appetizers</p>
            <div className="appe-items">
                <div className="name-desc">
                    {
                        props.a.map(ele => (
                            <div>
                              <div className="item-price">
                                <p className="appename">{ele.Title}</p>
                                <p>{ele.Price}</p>
                              </div>
                              <p className="desc">{ele.Description}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <StaticImage src="../images/saigonFoodPics/saigon_deli_spring_roll_with_shrimp.jpg" className="pho-img" alt="Spring Rolls" />
                <p className="desc">1. Spring Rolls - Goi Cuon</p>
              </div>
              <div className="img-desc">
                <StaticImage src="../images/saigonFoodPics/saigon_deli_Eggroll.jpg" className="pho-img" alt="Egg Rolls" />
                <p className="desc">2. Vegetarian Egg Rolls</p>
              </div>
            </div>
            <div className="pics">
              <div className="img-desc">
              <StaticImage src="../images/saigonFoodPics/saigon_deli_Combo_Sandwich_with_Wonton_soup.jpg" className="pho-img" alt="Banh Mi & Wonton Soup" />
              <p className="desc">3A. COMBO: Sandwich & Wonton soup</p>
              </div>
            </div>
        </div>
    )
}

export default Appetizers