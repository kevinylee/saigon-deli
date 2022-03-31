import * as React from "react"
import BoKho from "../images/saigonFoodPics/saigon_deli_Bo_Kho.jpg"


const SourSoup = (props) => {
    return (
        <div className="hotsoup">
            <p className="category-name" id="hotsoursoups">Hot & Sour Soup</p>
            <p className="description">Served with vermicelli noodles in a broth with pineapple chunks, tomatoes, and your choice of fish, meat, or seafood.</p>
            <div className="vegitems">
                <div className="names" id="hotsoup-names">
                    {
                        props.soursoup.map(ele => (
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
                    <img src={BoKho} className="pho-img" alt="Bo-Kho"></img>
                    <p className="desc">Beef Stew Noodle Soup (Hu Tieu Bo Kho)</p>
                </div>
            </div>
        </div>
    )
}

export default SourSoup