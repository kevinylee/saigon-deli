import * as React from "react"
import BunPic from "../images/saigonFoodPics/saigon_deli_Bun_with_charbroiled_Pork_and_eggroll.jpg"


const Bun = (props) => {
    return (
        <div className="bun">
            <p className="category-name" id="bun">Bun (Rice Vermicelli)</p>
            <p className="description">Vermicelli noodles topped with lettuce, bean sprouts, pickled carrots, crushed peanuts, and your choice of meat, seafood, or tofu. (optional: can add spicy lemongrass)</p>
            <div className="bunitems">
                <div className="names" id="bun-names">
                    {
                        props.bun.map(ele => (
                            <>
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="bunprices">
                    {
                        props.bun.map(ele => (
                            <>
                            <p>{ele.Price}</p>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={BunPic} className="pho-img" alt="bun"></img>
                <p className="desc">12. Bun with charbroiled pork & eggrolls</p>
              </div>
            </div>
        </div>
    )
}

export default Bun