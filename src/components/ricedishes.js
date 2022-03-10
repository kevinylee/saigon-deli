import * as React from "react"
import Special from "../images/saigonFoodPics/saigon_deli_Special_rice_with_pork.jpg"
import ShortRib from "../images/saigonFoodPics/saigon_deli_rice_with_short_ribs.jpg"
import Porkchop from "../images/saigonFoodPics/saigon_deli_Pork_chop_with_rice.jpg"
import RiceBeefVeg from "../images/saigonFoodPics/saigon_deli_Rice_with_Beef_and_Vegetables.jpg"
import BunBoHue from "../images/saigonFoodPics/saigon_deli_Bun_Bo_Hue.jpg"


const RiceDishes = (props) => {
    return (
        <div className="ricedishes">
            <p className="category-name" id="ricedishes">Rice Dishes</p>
            <p className="description">All of our rice dishes are served with steamed rice, vegetables, and your choice of meat, seafood, or tofu.
              We cook the vegetables with our in-house special sauce.</p>
            <div className="vegitems" id="rice-items">
                <div className="names" id="rice-names">
                    {
                        props.ricedishes.map(ele => (
                            <>
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="bunprices" id="rice-prices">
                    {
                        props.ricedishes.map(ele => (
                            <>
                            <p>{ele.Price}</p>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
                <div className="img-desc">
                    <img src={RiceBeefVeg} className="pho-img" alt="rice-with-beef-and-vegetables"></img>
                    <p className="desc">47. Rice with beef & vegetables</p>
                </div>
                <div className="img-desc">
                    <img src={Porkchop} className="pho-img" alt="rice-with-porkchop-and-egg"></img>
                    <p className="desc">58. Rice with pork chop & egg</p>
                </div>
            </div>
            <div className="pics">
                <div className="img-desc">
                    <img src={ShortRib} className="pho-img" alt="specialrice-with-pork"></img>
                    <p className="desc">61. Saigon Deli rice (short ribs)</p>
                </div>
                <div className="img-desc">
                    <img src={Special} className="pho-img" alt="specialrice-with-pork"></img>
                    <p className="desc">62. Special rice w/ pork</p>
                </div>
            </div>
            <div className="pics">
                <div className="img-desc">
                    <img src={BunBoHue} className="pho-img" alt="Bun-Bo-Hue"></img>
                    <p className="desc">63. Spicy Beef Noodle Soup (Bun Bo Hue)</p>
                </div>
            </div>
        </div>
    )
}

export default RiceDishes