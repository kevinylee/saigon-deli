import * as React from "react"
import BanhCanhPic from "../images/saigonFoodPics/saigon_deli_Banh_Canh_Soup.jpg"


const BanhCanh = (props) => {
    return (
        <div className="udon">
            <p className="category-name" id="banhcanh">Banh Canh (udon noodle soup)</p>
            <p className="description">Served with vegetables and your choice of the following:</p>
            <div className="vegitems">
                <div className="names" id="udon-names">
                    {
                        props.banhcanh.map(ele => (
                            <>
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="bunprices" id="udon-prices">
                    {
                        props.banhcanh.map(ele => (
                            <>
                            <p>{ele.Price}</p>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
                <div className="img-desc">
                    <img src={BanhCanhPic} className="pho-img" alt="banh-canh"></img>
                    <p className="desc">34. Banh canh w/ shrimp</p>
                </div>
            </div>
        </div>
    )
}

export default BanhCanh