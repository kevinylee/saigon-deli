import * as React from "react"
import PhoPic from "../images/saigonFoodPics/saigon_deli_Pho_Beef.jpg"



const Pho = (props) => {
    return (
        <div className="pho">
            <p className="category-name" id="pho">Pho (Noodle Soup)</p>
            <p className="description">Rice noodle soup with your choice of meat, seafood, or tofu. Served with beansprouts, basil, and lime.</p>
            <div className="phoitems">
                <div className="names">
                    {
                        props.pho.map(ele => (
                            <>
                            <p>{ele.Title}</p>
                            </>
                        ))
                    }
                </div>
                <div className="large">
                    <p>Large</p>
                    {
                        props.pho.map(ele => (
                            <>
                            <p>{ele.LargePrice}</p>
                            </>
                        ))
                    }
                </div>
                <div className="small">
                    <p>Small</p>
                    {
                        props.pho.map(ele => (
                            <>
                            <p>{ele.SmallPrice}</p>
                            </>
                        ))
                    }
                </div>
            </div>
            <div className="pics">
              <div className="img-desc">
                <img src={PhoPic} className="pho-img" alt="pho"></img>
                <p className="desc">11. Special Pho (beef and meatballs)</p>
              </div>
            </div>
        </div>
    )
}

export default Pho